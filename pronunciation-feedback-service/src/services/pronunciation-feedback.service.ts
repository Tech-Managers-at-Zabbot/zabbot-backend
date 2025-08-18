import fsPromises from "fs/promises";
import { decode } from "node-wav";
import Ffmpeg from "fluent-ffmpeg";
import ffmpegPath from "ffmpeg-static";
import path from "path";
import * as tf from "@tensorflow/tfjs-node";
import { WaveFile } from "wavefile";
import { OpenAI } from "openai";
import fs from "fs";
import levenshtein from "js-levenshtein";
import { SequenceMatcher } from "difflib";
import { ChartJSNodeCanvas } from "chartjs-node-canvas";
import { writeFile } from "fs/promises";
import DynamicTimeWarping from "dynamic-time-warping";
import { getEmbedding } from "./whisperEncoding";
import { v2 as cloudinary } from "cloudinary";
import axios from "axios";
import { errorUtilities, responseUtilities } from "../../../shared/utilities";
import referenePronunciationRepositories from "../repositories/reference-pronunciation.repository";
import { v4 } from "uuid";
import userPronunciationRepositories from "../repositories/user-pronunciation.repository";
import { StatusCodes } from "../../../shared/statusCodes/statusCodes.responses";
import UserPronunciation from "../../../shared/entities/pronunciation-feedback-service-entities/userPronunciation/user-pronunciation";

Ffmpeg.setFfmpegPath(ffmpegPath as string);

const sampleRate = 16000;

// Configure OpenAI with timeout
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  timeout: 120000, // 2 minutes timeout
  maxRetries: 3,
});

// Configure axios with timeout for external requests
axios.defaults.timeout = 60000; // 60 seconds
axios.defaults.maxRedirects = 3;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
  secure: true,
});

const comparePronounciation = errorUtilities.withServiceErrorHandling(
  async ({
    referencePronunciationId,
    file,
    userId,
    voice = "femaleVoice",
  }: {
    userId: string;
    referencePronunciationId: string;
    file: Express.Multer.File;
    voice?: string;
  }) => {
    const userfileName = file.filename.replace(/\.[^/.]+$/, "");
    const masterFileName = "referece_pronunciation";

    let filePaths: any = {};

    try {
      filePaths = await createFileDirectories({
        reqFileName: file.filename,
        userfileName,
        masterFileName,
      });

      const {
        userRawFilePath,
        userWavFilePath,
        userTrimmedFilePath,
        normalisedUserWavPath,
        masterRawFilePath,
        masterWavFilePath,
        masterTrimmedFilePath,
        normalisedMasterWavPath,
        plotPath,
        plotDTWPath,
      } = filePaths;

      console.log("Starting pronunciation comparison process...");

      const masterPronunciation = await referenePronunciationRepositories.getPronunciation(
        referencePronunciationId
      );
      if (!masterPronunciation) {
        throw errorUtilities.createError("Reference file not found", 404);
      }

      const url = masterPronunciation.get(voice) as string;
      console.log("Downloading master file...");
      await getMasterFile(url, masterRawFilePath);

      console.log("Processing user audio...");
      const { tensor: userTensor, raw: userRawAudio } = await loadAndTrimAudio({
        rawFilePath: userRawFilePath,
        wavFilePath: userWavFilePath,
        trimmedFilePath: userTrimmedFilePath,
      });

      console.log("Processing master audio...");
      const { tensor: masterTensor, raw: masterRawAudio } = await loadAndTrimAudio({
        rawFilePath: masterRawFilePath,
        trimmedFilePath: masterTrimmedFilePath,
        wavFilePath: masterWavFilePath,
      });

      if (isInvalid(userRawAudio)) {
        throw errorUtilities.createError(
          `Your recording was too short or too quiet`,
          400
        );
      }
      if (isInvalid(masterRawAudio)) {
        throw errorUtilities.createError(
          "Reference audio is too short or too quiet",
          500
        );
      }

      console.log("Normalizing audio...");
      const normalisedUserAudio = normalizeAudio(userTensor);
      const normalisedMasterAudio = normalizeAudio(masterTensor);

      const userRMS = await rms(normalisedUserAudio);
      const masterRMS = await rms(normalisedMasterAudio);
      console.log("Ref RMS:", masterRMS);
      console.log("User RMS:", userRMS);

      const [masterTensorScaled, userTensorScaled] = await matchVolumes(
        masterTensor,
        userTensor
      );

      console.log("Writing WAV files...");
      await writeWavFile(normalisedUserWavPath, sampleRate, userRawAudio);
      await writeWavFile(normalisedMasterWavPath, sampleRate, masterRawAudio);

      console.log("Generating embeddings...");
      // Add timeout wrapper for embedding generation
      const masterAudioEmbedding = await withTimeout(
        getEmbedding(normalisedMasterWavPath),
        120000, // 2 minutes
        "Master audio embedding generation timeout"
      );

      const userAudioEmbedding = await withTimeout(
        getEmbedding(normalisedUserWavPath),
        120000, // 2 minutes  
        "User audio embedding generation timeout"
      );

      console.log("Calculating embedding similarity...");
      const embeddingSimilarity = getEmbeddingSimilarity(
        userAudioEmbedding,
        masterAudioEmbedding
      );

      console.log("Getting transcriptions...");
      // Add timeout and retry logic for transcriptions
      const [userTranscription, masterTranscription] = await Promise.all([
        withTimeout(
          retryWithBackoff(() => getTranscription(normalisedUserWavPath), 3),
          180000, // 3 minutes
          "User transcription timeout"
        ),
        withTimeout(
          retryWithBackoff(() => getTranscription(normalisedMasterWavPath), 3),
          180000, // 3 minutes
          "Master transcription timeout"
        ),
      ]);

      console.log("User transcription:", userTranscription);
      console.log("Master transcription:", masterTranscription);

      const textSimilarity = transcriptionSimilarity(
        userTranscription,
        masterTranscription
      );

      const finalScore = Math.round((0.05 * embeddingSimilarity + 0.95 * textSimilarity) * 100) / 100;

      console.log("Creating plots...");
      await Promise.all([
        plotOverlay(masterRawAudio, userRawAudio, plotPath),
        plotDTW(masterAudioEmbedding, userAudioEmbedding, plotDTWPath),
      ]);

      let remark = "";
      if (finalScore > 0.85) {
        remark = "Excellent! Your pronunciation is perfect or close to perfect.";
      } else if (finalScore > 0.7) {
        remark = "Good attempt — there is room for improvement. Listen to recording & try again.";
      } else {
        remark = "Needs improvement — listen and try again.";
      }

      console.log("Uploading to Cloudinary...");
      const [plotDTWResult, plotResult, userPronunciationUpload] = await Promise.all([
        uploadToCloudinary({
          path: plotDTWPath,
          folder: "plots",
          assetType: "image",
        }),
        uploadToCloudinary({
          path: plotPath,
          folder: "plots",
          assetType: "image",
        }),
        uploadToCloudinary({
          path: userWavFilePath,
          folder: "userPronunciations",
          assetType: "video",
        }),
      ]);

      console.log("Saving user pronunciation data...");
      const userPronunciationData = await saveUserPronunciation({
        userId,
        pronunciationId: masterPronunciation.get("id"),
        recordingUrl: userPronunciationUpload,
        pronuciationPlotUrl: plotResult,
      });

      // Cleanup files
      await cleanupFiles(filePaths);

      console.log("Pronunciation comparison completed successfully");
      
      return responseUtilities.handleServicesResponse(
        StatusCodes.Created,
        "Pronunciation completed",
        {
          userPronunciationData,
          remark,
          refTransctipt: masterTranscription,
          userTranscript: userTranscription,
          embeddingSimilarity: embeddingSimilarity,
          textSimilarity: textSimilarity,
          finalScore,
          dtwPlot: plotDTWResult,
          plot: plotResult,
        }
      );
    } catch (error: any) {
      console.error("Error in pronunciation comparison:", error);
      
      // Ensure cleanup happens even on error
      if (filePaths && Object.keys(filePaths).length > 0) {
        await cleanupFiles(filePaths).catch(cleanupError => {
          console.error("Error during cleanup:", cleanupError);
        });
      }
      
      throw errorUtilities.createError(
        `Error comparing pronunciation: ${error.message}`,
        error.status || 500
      );
    }
  }
);

// Utility function to wrap promises with timeout
const withTimeout = <T>(
  promise: Promise<T>,
  timeoutMs: number,
  errorMessage = 'Operation timeout'
): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      setTimeout(() => reject(new Error(errorMessage)), timeoutMs);
    }),
  ]);
};

// Retry function with exponential backoff
const retryWithBackoff = async <T>(
  fn: () => Promise<T>,
  maxRetries: number,
  baseDelay: number = 1000
): Promise<T> => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      if (attempt === maxRetries) {
        throw error;
      }
      
      const delay = baseDelay * Math.pow(2, attempt - 1);
      console.log(`Attempt ${attempt} failed, retrying in ${delay}ms...`, error.message);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  throw new Error('Max retries exceeded');
};

// Centralized cleanup function
const cleanupFiles = async (filePaths: Record<string, string>) => {
  const filesToCleanup = [
    'userRawFilePath',
    'userTrimmedFilePath', 
    'userWavFilePath',
    'normalisedUserWavPath',
    'masterRawFilePath',
    'masterWavFilePath',
    'masterTrimmedFilePath',
    'normalisedMasterWavPath',
    'plotDTWPath',
    'plotPath'
  ];

  const cleanupPromises = filesToCleanup
    .filter(key => filePaths[key])
    .map(async (key) => {
      try {
        await fsPromises.unlink(filePaths[key]);
        console.log(`Cleaned up: ${key}`);
      } catch (error: any) {
        // Don't throw on cleanup errors, just log them
        if (error.code !== 'ENOENT') {
          console.warn(`Failed to cleanup ${key}:`, error.message);
        }
      }
    });

  await Promise.allSettled(cleanupPromises);
};

const getMasterFile = async (url: string, outputPath: string): Promise<void> => {
  try {
    const response = await axios.get(url, { 
      responseType: "stream",
      timeout: 60000, // 60 second timeout
    });
    
    const writeStream = fs.createWriteStream(outputPath);
    response.data.pipe(writeStream);

    return new Promise((resolve, reject) => {
      writeStream.on('finish', resolve);
      writeStream.on('error', reject);
      response.data.on('error', reject);
      
      // Add timeout for the write operation
      setTimeout(() => {
        reject(new Error('File download timeout'));
      }, 60000);
    });
  } catch (error: any) {
    throw errorUtilities.createError(
      `Failed to download master file: ${error.message}`,
      500
    );
  }
};

const uploadToCloudinary = async ({
  path,
  folder,
  assetType,
}: {
  path: string;
  folder?: string;
  assetType: "image" | "video";
}) => {
  try {
    console.log(`Uploading to Cloudinary: ${path}`);
    
    const audioUrl = await withTimeout(
      cloudinary.uploader.upload(path, {
        folder,
        resource_type: assetType,
        timeout: 120000, // 2 minutes
      }),
      180000, // 3 minutes total timeout
      'Cloudinary upload timeout'
    );
    
    return audioUrl.secure_url;
  } catch (error: any) {
    console.error(`Cloudinary upload error for ${path}:`, error);
    throw errorUtilities.createError(
      `Error uploading to cloudinary: ${error.message}`,
      500
    );
  }
};

// Enhanced transcription function with better error handling
const getTranscription = async (filePath: string): Promise<string> => {
  try {
    // Check if file exists before attempting transcription
    await fsPromises.access(filePath);
    
    const fileStats = await fsPromises.stat(filePath);
    if (fileStats.size === 0) {
      throw new Error("Audio file is empty");
    }
    
    console.log(`Getting transcription for: ${filePath} (${fileStats.size} bytes)`);
    
    const file = fs.createReadStream(filePath);
    
    const response = await openai.audio.transcriptions.create({
      model: "whisper-1",
      file: file,
      language: "en", // Specify language for better results
    });
    
    if (!response.text || response.text.trim().length === 0) {
      throw new Error("Empty transcription received");
    }
    
    return response.text.trim();
  } catch (error: any) {
    console.error(`Transcription error for ${filePath}:`, error);
    if (error.status === 413) {
      throw new Error("Audio file is too large for transcription");
    }
    if (error.status === 400) {
      throw new Error("Invalid audio file format");
    }
    throw new Error(`Transcription failed: ${error.message}`);
  }
};

// Rest of your functions remain the same but with added error handling...
// [Include all your other functions here with similar error handling improvements]

const loadAndTrimAudio = async ({
  trimmedFilePath,
  wavFilePath,
  rawFilePath,
}: {
  trimmedFilePath: string;
  rawFilePath: string;
  wavFilePath: string;
}): Promise<{
  tensor: tf.Tensor;
  raw: Float32Array;
}> => {
  try {
    console.log("Converting to WAV...");
    await convertAudio(rawFilePath, wavFilePath, (cmd) =>
      cmd.audioChannels(1).audioFrequency(16000).format("wav")
    );

    console.log("Trimming silence...");
    await convertAudio(wavFilePath, trimmedFilePath, (cmd) =>
      cmd.audioFilters("silenceremove=1:0:-30dB")
    );

    console.log("Reading trimmed file...");
    const fileBuffer = await fsPromises.readFile(trimmedFilePath);

    if (fileBuffer.length === 0) {
      throw new Error("Trimmed audio file is empty");
    }

    const result = await decode(fileBuffer);
    console.log("Decoded WAV file");

    if (!result.channelData || result.channelData.length === 0) {
      throw new Error("No audio channels found in decoded file");
    }

    const rawAudio = result.channelData[0];
    const audioSamples = Array.from(rawAudio);
    const tensorAudio = tf.tensor2d([audioSamples]);

    return {
      tensor: tensorAudio,
      raw: rawAudio,
    };
  } catch (err: any) {
    console.error("Audio processing error:", err);
    throw errorUtilities.createError(
      `Error processing audio: ${err.message}`,
      500
    );
  }
};

// Helper: Promisify ffmpeg save process with timeout
const convertAudio = (
  inputPath: string,
  outputPath: string,
  options: (cmd: Ffmpeg.FfmpegCommand) => void
): Promise<void> => {
  return new Promise((resolve, reject) => {
    const command = Ffmpeg(inputPath);
    options(command);
    
    // Add timeout for ffmpeg operations
    const timeout = setTimeout(() => {
      command.kill('SIGKILL');
      reject(new Error('FFmpeg operation timeout'));
    }, 60000); // 60 seconds
    
    command
      .save(outputPath)
      .on("end", () => {
        clearTimeout(timeout);
        resolve();
      })
      .on("error", (err) => {
        clearTimeout(timeout);
        reject(err);
      });
  });
};

// Rest of your utility functions...
const isInvalid = (
  audio: Float32Array<ArrayBufferLike>,
  threshold = 0.01,
  minDuration = 0.5
): boolean => {
  const isTooShort = audio.length < sampleRate * minDuration;
  const maxAmplitude = Math.max(...audio.map(Math.abs));
  const isTooQuiet = maxAmplitude < threshold;

  return isTooShort || isTooQuiet;
};

const normalizeAudio = (audioTensor: tf.Tensor): tf.Tensor => {
  const maxAbsValue = tf.max(tf.abs(audioTensor));
  const divisor = tf.add(maxAbsValue, 1e-8);
  const normalizedTensor = tf.div(audioTensor, divisor);
  return normalizedTensor;
};

const rms = async (tensor: tf.Tensor): Promise<number> => {
  const rmsValueTensor = tf.tidy(() => {
    const squared = tf.pow(tensor, 2);
    const mean = tf.mean(squared);
    return tf.sqrt(mean);
  });

  const rmsValue = (await rmsValueTensor.data())[0];
  rmsValueTensor.dispose();
  return rmsValue;
};

const matchVolumes = async (
  masterTensor: tf.Tensor,
  userTensor: tf.Tensor
): Promise<[tf.Tensor, tf.Tensor]> => {
  const masterRms = await rms(masterTensor);
  const userRms = await rms(userTensor);
  const scalingFactor = masterRms / (userRms + 1e-8);
  const userTensorScaled = tf.mul(userTensor, tf.scalar(scalingFactor));
  return [masterTensor, userTensorScaled];
};

const writeWavFile = async (
  path: string,
  sampleRate: number,
  audioData: Float32Array
): Promise<void> => {
  const wav = new WaveFile();
  wav.fromScratch(1, sampleRate, "32f", audioData);
  const buffer = wav.toBuffer();
  await fsPromises.writeFile(path, buffer);
  console.log(`WAV file written successfully: ${path}`);
};

const getEmbeddingSimilarity = (a: tf.Tensor2D, b: tf.Tensor2D) => {
  const minLen = Math.min(a.shape[0], b.shape[0]);
  const aSlice = a.slice([0, 0], [minLen, a.shape[1]]);
  const bSlice = b.slice([0, 0], [minLen, b.shape[1]]);
  
  const dotProduct = tf.sum(tf.mul(aSlice, bSlice), 1);
  const aNorm = tf.norm(aSlice, "euclidean", 1);
  const bNorm = tf.norm(bSlice, "euclidean", 1);
  const cosineSim = dotProduct.div(aNorm.mul(bNorm));
  
  const similarity = tf.sub(1, tf.mean(cosineSim));
  return similarity.dataSync()[0];
};

const transcriptionSimilarity = (a: string, b: string) => {
  const matcher = new SequenceMatcher(null, a, b);
  const seqSim = matcher.ratio();
  
  const levDist = levenshtein(a, b);
  const maxLen = Math.max(a.length, b.length, 1);
  const levSim = 1 - levDist / maxLen;
  
  return Math.min(seqSim, levSim);
};

const plotOverlay = async (
  refData: Float32Array,
  userData: Float32Array,
  outputPath: string
): Promise<void> => {
  const width = 1000;
  const height = 400;
  const minLen = Math.min(refData.length, userData.length);
  const labels = Array.from({ length: minLen }, (_, i) => i);

  const refSlice = Array.from(refData.slice(0, minLen));
  const userSlice = Array.from(userData.slice(0, minLen));

  const configuration = {
    type: "line" as const,
    data: {
      labels: labels,
      datasets: [
        {
          label: "Reference",
          data: refSlice,
          borderColor: "blue",
          fill: false,
          pointRadius: 0,
          borderWidth: 1,
        },
        {
          label: "User",
          data: userSlice,
          borderColor: "red",
          fill: false,
          pointRadius: 0,
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: false,
      plugins: {
        title: {
          display: true,
          text: "Overlay of Trimmed Reference and User Waveforms",
        },
        legend: {
          display: true,
          position: "top" as const,
        },
      },
      scales: {
        x: {
          title: {
            display: true,
            text: "Sample Index",
          },
        },
        y: {
          title: {
            display: true,
            text: "Amplitude",
          },
        },
      },
    },
  };

  const canvas = new ChartJSNodeCanvas({ width, height });
  const imageBuffer = await canvas.renderToBuffer(configuration);
  await writeFile(outputPath, imageBuffer);
};

function cosineDistance(a: number[], b: number[]): number {
  const dot = a.reduce((sum, val, i) => sum + val * b[i], 0);
  const normA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
  const normB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
  return 1 - dot / (normA * normB + 1e-8);
}

const tensorTo2DArray = async (tensor: tf.Tensor2D): Promise<number[][]> => {
  const data = await tensor.array();
  return data as number[][];
};

const plotDTW = async (
  refEmbed: tf.Tensor2D,
  userEmbed: tf.Tensor2D,
  outputPath: string
): Promise<void> => {
  const ref = await tensorTo2DArray(refEmbed);
  const user = await tensorTo2DArray(userEmbed);

  const dtw = new DynamicTimeWarping(ref, user, cosineDistance);
  const distance = dtw.getDistance();
  const pathPts = dtw.getPath();

  const x: number[] = pathPts.map(([x]) => x);
  const y: number[] = pathPts.map(([, y]) => y);

  const width = 600;
  const height = 600;
  const chartJSNodeCanvas = new ChartJSNodeCanvas({ width, height });

  const config = {
    type: "line" as const,
    data: {
      labels: x,
      datasets: [
        {
          label: "DTW Path",
          data: y,
          borderColor: "purple",
          borderWidth: 1,
          pointRadius: 0,
          fill: false,
        },
      ],
    },
    options: {
      responsive: false,
      plugins: {
        title: {
          display: true,
          text: "DTW Alignment Path",
        },
        legend: {
          display: false,
        },
      },
      scales: {
        x: {
          title: {
            display: true,
            text: "Reference Frame",
          },
        },
        y: {
          title: {
            display: true,
            text: "User Frame",
          },
        },
      },
    },
  };

  const buffer = await chartJSNodeCanvas.renderToBuffer(config);
  await writeFile(outputPath, buffer);
};

const saveUserPronunciation = async ({
  userId,
  pronuciationPlotUrl,
  recordingUrl,
  pronunciationId,
}: {
  userId: string;
  pronunciationId: string;
  recordingUrl: string;
  pronuciationPlotUrl: string;
}): Promise<UserPronunciation> => {
  const userPronunciationData = {
    id: v4(),
    userId,
    pronunciationId,
    recordingUrl,
    pronuciationPlotUrl,
  };
  return userPronunciationRepositories.addPronunciation(userPronunciationData);
};

const createFileDirectories = async ({
  userfileName,
  masterFileName,
  reqFileName,
}: {
  userfileName: string;
  masterFileName: string;
  reqFileName: string;
}) => {
  const userRawFilePath = path.join(
    __dirname,
    "../utilities/audioFiles/uploads/raw",
    reqFileName
  );
  const paths: Record<string, string> = {
    userRawFilePath,
  };

  const userFilePaths = {
    userWavFilePath: "../utilities/audioFiles/uploads/wavs",
    userTrimmedFilePath: "../utilities/audioFiles/uploads/trimmed",
    normalisedUserWavPath: "../utilities/audioFiles/uploads/normalized",
  };
  for (let key in userFilePaths) {
    const directory = path.join(
      __dirname,
      userFilePaths[key as keyof typeof userFilePaths]
    );
    await fsPromises.mkdir(directory, { recursive: true });
    paths[key] = path.join(directory, `${userfileName}.wav`);
  }

  const masterFilePaths = {
    masterRawFilePath: "../utilities/audioFiles/master/raw",
    masterWavFilePath: "../utilities/audioFiles/master/wavs",
    masterTrimmedFilePath: "../utilities/audioFiles/master/trimmed",
    normalisedMasterWavPath: "../utilities/audioFiles/master/normalized",
  };
  for (let key in masterFilePaths) {
    const directory = path.join(
      __dirname,
      masterFilePaths[key as keyof typeof masterFilePaths]
    );
    await fsPromises.mkdir(directory, { recursive: true });
    paths[key] = path.join(directory, `${masterFileName}.wav`);
  }

  const plotPaths = {
    plotPath: "../utilities/audioFiles/plots",
    plotDTWPath: "../utilities/audioFiles/plots",
  };
  for (let key in plotPaths) {
    const directory = path.join(
      __dirname,
      plotPaths[key as keyof typeof plotPaths]
    );
    await fsPromises.mkdir(directory, { recursive: true });
    const suffix = key.split("Path")[0];
    paths[key] = path.join(directory, `${userfileName}_${suffix}.png`);
  }
  return paths;
};

export default {
  comparePronounciation,
};