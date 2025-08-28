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
import { v2 as cloudinary } from "cloudinary";
import axios from "axios";
import { errorUtilities, responseUtilities } from "../../../shared/utilities";
import referenePronunciationRepositories from "../repositories/reference-pronunciation.repository";
import { v4 } from "uuid";
import userPronunciationRepositories from "../repositories/user-pronunciation.repository";
import { StatusCodes } from "../../../shared/statusCodes/statusCodes.responses";
import UserPronunciation from "../../../shared/entities/pronunciation-feedback-service-entities/userPronunciation/user-pronunciation";
import config from "../../../config/config";


interface EmbeddingResponse {
  data: { embedding: number[] }[];
}


Ffmpeg.setFfmpegPath(ffmpegPath as string);

const sampleRate = 16000;
const openai = new OpenAI({
  apiKey: config.OPENAI_API_KEY,
});

cloudinary.config({
  cloud_name: config.CLOUDINARY_CLOUD_NAME!,
  api_key: config.CLOUDINARY_API_KEY!,
  api_secret: config.CLOUDINARY_API_SECRET!,
  secure: true,
});

// Helper function to log memory usage
const logMemoryUsage = (label: string) => {
  const used = process.memoryUsage();
  console.log(`${label} - Memory usage:`, {
    rss: `${Math.round(used.rss / 1024 / 1024)} MB`,
    heapTotal: `${Math.round(used.heapTotal / 1024 / 1024)} MB`,
    heapUsed: `${Math.round(used.heapUsed / 1024 / 1024)} MB`,
  });
};

// Helper to safely dispose of tensors
const safeTensorDispose = (tensor: tf.Tensor | null) => {
  if (tensor && !tensor.isDisposed) {
    tensor.dispose();
  }
};

// New lightweight embedding function using OpenAI API
const getTextEmbedding = async (text: string): Promise<number[]> => {
  try {
    const response = await openai.embeddings.create({
      model: "text-embedding-3-small", // Most cost-effective option
      input: text.toLowerCase().trim(), // Normalize text
      encoding_format: "float",
    }) as EmbeddingResponse;;

    return response.data[0].embedding;
  } catch (error: any) {
    throw errorUtilities.createError(
      `Error getting text embedding: ${error.message}`,
      500
    );
  }
};

// Helper function for cosine similarity
const calculateCosineSimilarity = (vecA: number[] | any, vecB: number[] | any[]): number => {
  const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
  const normA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
  const normB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
  return dotProduct / (normA * normB);
};

// Enhanced text similarity function using embeddings
const getEnhancedTextSimilarity = async (
  userTranscription: string,
  masterTranscription: string
): Promise<{
  embeddingSimilarity: number;
  textSimilarity: number;
  combinedSimilarity: number;
}> => {
  // Get embeddings for both transcriptions
  const [userEmbedding, masterEmbedding] = await Promise.all([
    getTextEmbedding(userTranscription),
    getTextEmbedding(masterTranscription),
  ]);

  // Calculate cosine similarity between embeddings
  const embeddingSimilarity = calculateCosineSimilarity(
    userEmbedding,
    masterEmbedding
  );

  // Keep existing text similarity calculation
  const matcher = new SequenceMatcher(
    null,
    userTranscription,
    masterTranscription
  );
  const seqSim = matcher.ratio();

  const levDist = levenshtein(userTranscription, masterTranscription);
  const maxLen = Math.max(
    userTranscription.length,
    masterTranscription.length,
    1
  );
  const levSim = 1 - levDist / maxLen;

  const textSimilarity = Math.min(seqSim, levSim);

  // Combine embedding and text similarities (embedding weighted higher)
  const combinedSimilarity = embeddingSimilarity * 0.7 + textSimilarity * 0.3;

  return {
    embeddingSimilarity,
    textSimilarity,
    combinedSimilarity,
  };
};

// Helper function to clean up files
const cleanupFiles = async (filePaths: string[]) => {
  const cleanupPromises = filePaths.map(async (filePath) => {
    try {
      await fsPromises.unlink(filePath);
    } catch (error) {
      // Ignore errors if file doesn't exist
      console.warn(`Could not delete file ${filePath}:`, error);
    }
  });

  await Promise.allSettled(cleanupPromises);
};

const comparePronounciation = errorUtilities.withServiceErrorHandling(
  async ({
    referencePronunciationId,
    file,
    userId,
    voice = "femaleVoice",
  }: {
    userId: string;
    referencePronunciationId: string;
    file: any
    voice?: string;
  }) => {
    logMemoryUsage("Start of comparePronounciation");

    const userfileName = file.filename.replace(/\.[^/.]+$/, "");
    const masterFileName = "referece_pronunciation";

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
    } = await createFileDirectories({
      reqFileName: file.filename,
      userfileName,
      masterFileName,
    });

    // Only keep essential tensor references (no heavy embedding tensors)
    let userTensor: tf.Tensor | null = null;
    let masterTensor: tf.Tensor | null = null;
    let normalisedUserAudio: tf.Tensor | null = null;
    let normalisedMasterAudio: tf.Tensor | null = null;
    let masterTensorScaled: tf.Tensor | null = null;
    let userTensorScaled: tf.Tensor | null = null;

    try {
      const masterPronunciation =
        await referenePronunciationRepositories.getPronunciation(
          referencePronunciationId
        );
      if (!masterPronunciation) {
        throw errorUtilities.createError("Reference file not found", 404);
      }

      const url = masterPronunciation.get(voice) as string;
      await getMasterFile(url, masterRawFilePath);

      logMemoryUsage("Before user audio processing");
      const { tensor: userTensorRaw, raw: userRawAudio } =
        await loadAndTrimAudio({
          rawFilePath: userRawFilePath,
          wavFilePath: userWavFilePath,
          trimmedFilePath: userTrimmedFilePath,
        });
      userTensor = userTensorRaw;

      logMemoryUsage("Before master audio processing");
      const { tensor: masterTensorRaw, raw: masterRawAudio } =
        await loadAndTrimAudio({
          rawFilePath: masterRawFilePath,
          trimmedFilePath: masterTrimmedFilePath,
          wavFilePath: masterWavFilePath,
        });
      masterTensor = masterTensorRaw;

      logMemoryUsage("After audio loading");

      if (isInvalid(userRawAudio)) {
        throw errorUtilities.createError(
          `Your recording was too short or too quiet`,
          500
        );
      }
      if (isInvalid(masterRawAudio)) {
        throw errorUtilities.createError(
          "Reference audio is too short or too quiet",
          500
        );
      }

      // Normalize audio after trimming
      normalisedUserAudio = normalizeAudio(userTensor);
      normalisedMasterAudio = normalizeAudio(masterTensor);

      logMemoryUsage("After audio normalization");

      // RMS calculation for monitoring
      const userRMS = await rms(normalisedUserAudio);
      const masterRMS = await rms(normalisedMasterAudio);
      console.log("Ref RMS:", masterRMS);
      console.log("User RMS:", userRMS);

      // Volume matching (keeping for consistency)
      const [masterScaled, userScaled] = await matchVolumes(
        masterTensor,
        userTensor
      );
      masterTensorScaled = masterScaled;
      userTensorScaled = userScaled;

      logMemoryUsage("After volume matching");

      // Save normalized WAVs for transcription
      await writeWavFile(normalisedUserWavPath, sampleRate, userRawAudio);
      await writeWavFile(normalisedMasterWavPath, sampleRate, masterRawAudio);

      logMemoryUsage("Before transcriptions");

      // Get transcriptions in parallel (this is lightweight)
      const [userTranscription, masterTranscription] = await Promise.all([
        getTranscription(normalisedUserWavPath),
        getTranscription(normalisedMasterWavPath),
      ]);

      logMemoryUsage("After transcriptions");

      // Use OpenAI embeddings instead of heavy audio embeddings
      const { embeddingSimilarity, textSimilarity, combinedSimilarity } =
        await getEnhancedTextSimilarity(userTranscription, masterTranscription);

      logMemoryUsage("After embedding similarity");

      // Use the combined similarity as your final score
      const finalScore = Math.round(combinedSimilarity * 100) / 100;

      // Create waveform plot (keep this lightweight visualization)
      await plotOverlay(masterRawAudio, userRawAudio, plotPath);
      logMemoryUsage("After plot overlay");

      let remark = "";
      if (finalScore > 0.85) {
        remark =
          "Excellent! Your pronunciation is perfect or close to perfect.";
      } else if (finalScore > 0.7) {
        remark =
          "Good attempt — there is room for improvement. Listen to recording & try again.";
      } else {
        remark = "Needs improvement — listen and try again.";
      }

      // Upload results
      const plotResult = await uploadToCloudinary({
        path: plotPath,
        folder: "plots",
        assetType: "image",
      });
      const userPronunciationUpload = await uploadToCloudinary({
        path: userWavFilePath,
        folder: "userPronunciations",
        assetType: "video",
      });

      const userPronunciationData = await saveUserPronunciation({
        userId,
        pronunciationId: masterPronunciation.get("id"),
        recordingUrl: userPronunciationUpload,
        pronuciationPlotUrl: plotResult,
      });

      // Clean up files
      await cleanupFiles([
        userRawFilePath,
        userTrimmedFilePath,
        userWavFilePath,
        normalisedUserWavPath,
        masterRawFilePath,
        masterWavFilePath,
        masterTrimmedFilePath,
        normalisedMasterWavPath,
        plotPath,
      ]);

      logMemoryUsage("End of comparePronounciation - success");

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
          plot: plotResult,
          // Removed dtwPlot to save memory
        }
      );
    } catch (error: any) {
      // Clean up files on error
      await cleanupFiles([
        userRawFilePath,
        userTrimmedFilePath,
        userWavFilePath,
        normalisedUserWavPath,
        masterRawFilePath,
        masterWavFilePath,
        masterTrimmedFilePath,
        normalisedMasterWavPath,
        plotPath,
      ]);

      logMemoryUsage("End of comparePronounciation - error");

      throw errorUtilities.createError(
        `Error comparing pronunciation: ${error.message}`,
        500
      );
    } finally {
      // Clean up tensors (much fewer now!)
      safeTensorDispose(userTensor);
      safeTensorDispose(masterTensor);
      safeTensorDispose(normalisedUserAudio);
      safeTensorDispose(normalisedMasterAudio);
      safeTensorDispose(
        masterTensorScaled !== masterTensor ? masterTensorScaled : null
      );
      safeTensorDispose(userTensorScaled);

      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }

      logMemoryUsage("After tensor cleanup");
    }
  }
);

const getMasterFile = async (url: string, outputPath: string) => {
  const response = await axios.get(url, { responseType: "stream" });
  response.data.pipe(fs.createWriteStream(outputPath));

  return new Promise((resolve, reject) => {
    response.data.on("end", resolve);
    response.data.on("error", reject);
  });
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
    const audioUrl = await cloudinary.uploader.upload(path, {
      folder,
      resource_type: assetType,
    });
    return audioUrl.secure_url;
  } catch (error: any) {
    throw errorUtilities.createError(
      `Error uploading user pronunciation to cloudinary: ${error.message}`,
      500
    );
  }
};

// Helper: Promisify ffmpeg save process
const convertAudio = (
  inputPath: string,
  outputPath: string,
  options: (cmd: Ffmpeg.FfmpegCommand) => void
): Promise<void> => {
  return new Promise((resolve, reject) => {
    const command = Ffmpeg(inputPath);
    options(command);
    command
      .save(outputPath)
      .on("end", () => resolve())
      .on("error", (err) => reject(err));
  });
};

export const loadAndTrimAudio = async ({
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
  let tensorAudio: tf.Tensor | null = null;

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

    const result = await decode(fileBuffer);
    console.log("Decoded WAV file");

    const rawAudio = result.channelData[0]; // Float32Array
    const audioSamples = Array.from(rawAudio);

    tensorAudio = tf.tensor2d([audioSamples]);

    return {
      tensor: tensorAudio,
      raw: rawAudio,
    };
  } catch (err: any) {
    // Clean up tensor if creation failed
    safeTensorDispose(tensorAudio);
    throw errorUtilities.createError(
      `Error processing audio: ${err.message}`,
      500
    );
  }
};

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
  return tf.tidy(() => {
    // Find the maximum absolute value in the tensor.
    const maxAbsValue = tf.max(tf.abs(audioTensor));
    // Add a small epsilon to prevent division by zero.
    const divisor = tf.add(maxAbsValue, 1e-8);
    // Perform the normalization.
    return tf.div(audioTensor, divisor);
  });
};

const rms = async (tensor: tf.Tensor): Promise<number> => {
  // Use tf.tidy to automatically clean up intermediate tensors
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

  const userTensorScaled = tf.tidy(() => {
    return tf.mul(userTensor, tf.scalar(scalingFactor));
  });

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
  console.log(`WAV file written successfully`);
};

const getTranscription = async (filePath: string) => {
  const file = fs.createReadStream(filePath);

  const response = await openai.audio.transcriptions.create({
    model: "whisper-1",
    file: file,
  });
  return response.text;
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
  };
  for (let key in plotPaths) {
    const directory = path.join(
      __dirname,
      plotPaths[key as keyof typeof plotPaths]
    );
    await fsPromises.mkdir(directory, { recursive: true });
    if (key && typeof key === "string" && key.includes("Path")) {
      const suffix = key.split("Path")[0];
      paths[key] = path.join(directory, `${userfileName}_${suffix}.png`);
    }
    // const suffix = key.split("Path")[0];
    // paths[key] = path.join(directory, `${userfileName}_${suffix}.png`);
  }
  return paths;
};

export default {
  comparePronounciation,
};
