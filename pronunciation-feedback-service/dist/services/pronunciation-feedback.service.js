"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadAndTrimAudio = void 0;
const promises_1 = __importDefault(require("fs/promises"));
const node_wav_1 = require("node-wav");
const fluent_ffmpeg_1 = __importDefault(require("fluent-ffmpeg"));
const path_1 = __importDefault(require("path"));
const tf = __importStar(require("@tensorflow/tfjs-node"));
const wavefile_1 = require("wavefile");
const openai_1 = require("openai");
const fs_1 = __importDefault(require("fs"));
const js_levenshtein_1 = __importDefault(require("js-levenshtein"));
const difflib_1 = require("difflib");
const chartjs_node_canvas_1 = require("chartjs-node-canvas");
const promises_2 = require("fs/promises");
const dynamic_time_warping_1 = __importDefault(require("dynamic-time-warping"));
const whisperEncoding_1 = require("./whisperEncoding");
const cloudinary_1 = require("cloudinary");
const axios_1 = __importDefault(require("axios"));
const utilities_1 = require("../../../shared/utilities");
const reference_pronunciation_repository_1 = __importDefault(require("../repositories/reference-pronunciation.repository"));
const uuid_1 = require("uuid");
const user_pronunciation_repository_1 = __importDefault(require("../repositories/user-pronunciation.repository"));
const statusCodes_responses_1 = require("../../../shared/statusCodes/statusCodes.responses");
const sampleRate = 16000;
const openai = new openai_1.OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});
cloudinary_1.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
});
const comparePronounciation = utilities_1.errorUtilities.withServiceErrorHandling(async ({ referencePronunciationId, file, userId, voice = "femaleVoice", }) => {
    const userfileName = file.filename.replace(/\.[^/.]+$/, "");
    const masterFileName = "referece_pronunciation";
    const { userRawFilePath, userWavFilePath, userTrimmedFilePath, normalisedUserWavPath, masterRawFilePath, masterWavFilePath, masterTrimmedFilePath, normalisedMasterWavPath, plotPath, plotDTWPath, } = await createFileDirectories({
        reqFileName: file.filename,
        userfileName,
        masterFileName,
    });
    try {
        const masterPronunciation = await reference_pronunciation_repository_1.default.getPronunciation(referencePronunciationId);
        if (!masterPronunciation) {
            throw utilities_1.errorUtilities.createError("Reference file not found", 404);
        }
        const url = masterPronunciation.get(voice);
        await getMasterFile(url, masterRawFilePath);
        const { tensor: userTensor, raw: userRawAudio } = await (0, exports.loadAndTrimAudio)({
            rawFilePath: userRawFilePath,
            wavFilePath: userWavFilePath,
            trimmedFilePath: userTrimmedFilePath,
        });
        const { tensor: masterTensor, raw: masterRawAudio } = await (0, exports.loadAndTrimAudio)({
            rawFilePath: masterRawFilePath,
            trimmedFilePath: masterTrimmedFilePath,
            wavFilePath: masterWavFilePath,
        });
        if (isInvalid(userRawAudio)) {
            throw utilities_1.errorUtilities.createError(`Your recording was too short or too quiet`, 500);
        }
        if (isInvalid(masterRawAudio)) {
            throw utilities_1.errorUtilities.createError("Reference audio is too short or too quiet", 500);
        }
        // Normalize audio after trimming
        const normalisedUserAudio = normalizeAudio(userTensor);
        const normalisedMasterAudio = normalizeAudio(masterTensor);
        // before volume match
        const userRMS = await rms(normalisedUserAudio);
        const masterRMS = await rms(normalisedMasterAudio);
        console.log("Ref RMS:", masterRMS);
        console.log("User RMS:", userRMS);
        // after volume match
        const [masterTensorScaled, userTensorScaled] = await matchVolumes(masterTensor, userTensor);
        //  Save trimmed & normalized WAVs
        await writeWavFile(normalisedUserWavPath, sampleRate, userRawAudio);
        await writeWavFile(normalisedMasterWavPath, sampleRate, masterRawAudio);
        // Embedding similarity
        const masterAudioEmbedding = await (0, whisperEncoding_1.getEmbedding)(normalisedMasterWavPath);
        const userAudioEmbedding = await (0, whisperEncoding_1.getEmbedding)(normalisedUserWavPath);
        const embeddingSimilarity = getEmbeddingSimilarity(userAudioEmbedding, masterAudioEmbedding);
        // Transcriptions
        const userTranscription = await getTranscription(normalisedUserWavPath);
        const masterTranscription = await getTranscription(normalisedMasterWavPath);
        const textSimilarity = transcriptionSimilarity(userTranscription, masterTranscription);
        const finalScore = Math.round((0.05 * embeddingSimilarity + 0.95 * textSimilarity) * 100) /
            100;
        await plotOverlay(masterRawAudio, userRawAudio, plotPath);
        await plotDTW(masterAudioEmbedding, userAudioEmbedding, plotDTWPath);
        let remark = "";
        if (finalScore > 0.85) {
            remark =
                "Excellent! Your pronunciation is perfect or close to perfect.";
        }
        else if (finalScore > 0.7) {
            remark =
                "Good attempt — there is room for improvement. Listen to recording & try again.";
        }
        else {
            remark = "Needs improvement — listen and try again.";
        }
        const plotDTWResult = await uploadToCloudinary({
            path: plotDTWPath,
            folder: "plots",
            assetType: "image",
        });
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
        promises_1.default.unlink(userRawFilePath);
        promises_1.default.unlink(userTrimmedFilePath);
        promises_1.default.unlink(userWavFilePath);
        promises_1.default.unlink(normalisedUserWavPath);
        promises_1.default.unlink(masterRawFilePath);
        promises_1.default.unlink(masterWavFilePath);
        promises_1.default.unlink(masterTrimmedFilePath);
        promises_1.default.unlink(normalisedMasterWavPath);
        promises_1.default.unlink(plotDTWPath);
        promises_1.default.unlink(plotPath);
        return utilities_1.responseUtilities.handleServicesResponse(statusCodes_responses_1.StatusCodes.Created, "Pronunciation completed", {
            userPronunciationData,
            remark,
            refTransctipt: masterTranscription,
            userTranscript: userTranscription,
            embeddingSimilarity: embeddingSimilarity,
            textSimilarity: textSimilarity,
            finalScore,
            dtwPlot: plotDTWResult,
            plot: plotResult,
        });
    }
    catch (error) {
        promises_1.default.unlink(userRawFilePath);
        promises_1.default.unlink(userTrimmedFilePath);
        promises_1.default.unlink(userWavFilePath);
        promises_1.default.unlink(normalisedUserWavPath);
        promises_1.default.unlink(masterRawFilePath);
        promises_1.default.unlink(masterWavFilePath);
        promises_1.default.unlink(masterTrimmedFilePath);
        promises_1.default.unlink(normalisedMasterWavPath);
        promises_1.default.unlink(plotDTWPath);
        promises_1.default.unlink(plotPath);
        throw utilities_1.errorUtilities.createError(`Error comparing pronunciation: ${error.message}`, 500);
    }
});
const getMasterFile = async (url, outputPath) => {
    const response = await axios_1.default.get(url, { responseType: "stream" });
    response.data.pipe(fs_1.default.createWriteStream(outputPath));
    return new Promise((resolve, reject) => {
        response.data.on("end", resolve);
        response.data.on("error", reject);
    });
};
const uploadToCloudinary = async ({ path, folder, assetType, }) => {
    try {
        const audioUrl = await cloudinary_1.v2.uploader.upload(path, {
            folder,
            resource_type: assetType,
        });
        return audioUrl.secure_url;
    }
    catch (error) {
        throw utilities_1.errorUtilities.createError(`Error uploading user pronunciation to cloudinary: ${error.message}`, 500);
    }
};
// Helper: Promisify ffmpeg save process
const convertAudio = (inputPath, outputPath, options) => {
    return new Promise((resolve, reject) => {
        const command = (0, fluent_ffmpeg_1.default)(inputPath);
        options(command);
        command
            .save(outputPath)
            .on("end", () => resolve())
            .on("error", (err) => reject(err));
    });
};
const loadAndTrimAudio = async ({ trimmedFilePath, wavFilePath, rawFilePath, }) => {
    try {
        console.log("Converting to WAV...");
        await convertAudio(rawFilePath, wavFilePath, (cmd) => cmd.audioChannels(1).audioFrequency(16000).format("wav"));
        console.log("Trimming silence...");
        await convertAudio(wavFilePath, trimmedFilePath, (cmd) => cmd.audioFilters("silenceremove=1:0:-30dB"));
        console.log("Reading trimmed file...");
        const fileBuffer = await promises_1.default.readFile(trimmedFilePath);
        const result = await (0, node_wav_1.decode)(fileBuffer);
        console.log("Decoded WAV file");
        const rawAudio = result.channelData[0]; // Float32Array
        const audioSamples = Array.from(rawAudio);
        const tensorAudio = tf.tensor2d([audioSamples]);
        return {
            tensor: tensorAudio,
            raw: rawAudio,
        };
    }
    catch (err) {
        throw utilities_1.errorUtilities.createError(`Error processing audio: ${err.message}`, 500);
    }
};
exports.loadAndTrimAudio = loadAndTrimAudio;
const isInvalid = (audio, threshold = 0.01, minDuration = 0.5) => {
    const isTooShort = audio.length < sampleRate * minDuration;
    const maxAmplitude = Math.max(...audio.map(Math.abs));
    const isTooQuiet = maxAmplitude < threshold;
    return isTooShort || isTooQuiet;
};
const normalizeAudio = (audioTensor) => {
    // Find the maximum absolute value in the tensor.
    // We use tf.abs() to get the absolute values before finding the maximum.
    const maxAbsValue = tf.max(tf.abs(audioTensor));
    // Add a small epsilon (1e-8) to the maximum absolute value to prevent
    // division by zero, which could happen if the audioTensor is all zeros.
    const divisor = tf.add(maxAbsValue, 1e-8);
    // Perform the normalization by dividing the entire tensor by the divisor.
    // The tf.div() function handles this element-wise division.
    const normalizedTensor = tf.div(audioTensor, divisor);
    return normalizedTensor;
};
const rms = async (tensor) => {
    // Ensure the tensor is properly disposed of to prevent memory leaks.
    const rmsValueTensor = tf.tidy(() => {
        // Square the tensor elements.
        const squared = tf.pow(tensor, 2);
        // Find the mean of the squared elements.
        const mean = tf.mean(squared);
        // Take the square root to get the RMS value.
        return tf.sqrt(mean);
    });
    // Extract the single number from the resulting tensor.
    // We use .data() because the operations are asynchronous.
    const rmsValue = (await rmsValueTensor.data())[0];
    // Dispose of the tensor to free up GPU memory.
    rmsValueTensor.dispose();
    return rmsValue;
};
const matchVolumes = async (masterTensor, userTensor) => {
    // Use the reusable rms function to get the RMS values.
    const masterRms = await rms(masterTensor);
    const userRms = await rms(userTensor);
    // Calculate the scaling factor. Add a small epsilon (1e-8) to prevent
    // division by zero if the user's audio tensor is all zeros.
    const scalingFactor = masterRms / (userRms + 1e-8);
    // Apply the scaling factor to the user's tensor.
    const userTensorScaled = tf.mul(userTensor, tf.scalar(scalingFactor));
    // Return the original reference tensor and the scaled user tensor.
    // Note that we return a Promise that resolves to a tuple of tensors.
    return [masterTensor, userTensorScaled];
};
const writeWavFile = async (path, sampleRate, audioData) => {
    const wav = new wavefile_1.WaveFile();
    // From the given audio data, create a new WaveFile with the specified sample rate,
    // number of channels (1 for mono), and bit depth (32-bit floating point, same as Float32Array).
    // The value '32f' is used for 32-bit float audio, matching the input data type.
    wav.fromScratch(1, sampleRate, "32f", audioData);
    // Convert the WaveFile object into a Buffer that can be written to disk.
    const buffer = wav.toBuffer();
    // Write the buffer to the specified file path asynchronously.
    await promises_1.default.writeFile(path, buffer);
    console.log(`WAV file written successfully`);
};
const getEmbeddingSimilarity = (a, b) => {
    // Ensure same number of frames (rows)
    const minLen = Math.min(a.shape[0], b.shape[0]);
    const aSlice = a.slice([0, 0], [minLen, a.shape[1]]);
    const bSlice = b.slice([0, 0], [minLen, b.shape[1]]);
    // Compute cosine similarity per frame
    const dotProduct = tf.sum(tf.mul(aSlice, bSlice), 1); // shape: [minLen]
    const aNorm = tf.norm(aSlice, "euclidean", 1); // shape: [minLen]
    const bNorm = tf.norm(bSlice, "euclidean", 1); // shape: [minLen]
    const cosineSim = dotProduct.div(aNorm.mul(bNorm)); // shape: [minLen]
    // Mean cosine similarity and subtract from 1
    const similarity = tf.sub(1, tf.mean(cosineSim));
    return similarity.dataSync()[0]; // Return scalar as number
};
const getTranscription = async (filePath) => {
    const file = fs_1.default.createReadStream(filePath);
    const response = await openai.audio.transcriptions.create({
        model: "whisper-1",
        file: file,
    });
    return response.text;
};
const transcriptionSimilarity = (a, b) => {
    // Sequence similarity (like difflib.SequenceMatcher)
    const matcher = new difflib_1.SequenceMatcher(null, a, b);
    const seqSim = matcher.ratio();
    // Levenshtein similarity
    const levDist = (0, js_levenshtein_1.default)(a, b);
    const maxLen = Math.max(a.length, b.length, 1);
    const levSim = 1 - levDist / maxLen;
    // Conservative estimate: return the lower of the two
    return Math.min(seqSim, levSim);
};
const plotOverlay = async (refData, userData, outputPath) => {
    const width = 1000;
    const height = 400;
    const minLen = Math.min(refData.length, userData.length);
    const labels = Array.from({ length: minLen }, (_, i) => i);
    const refSlice = Array.from(refData.slice(0, minLen));
    const userSlice = Array.from(userData.slice(0, minLen));
    const configuration = {
        type: "line",
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
                    position: "top",
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
    const canvas = new chartjs_node_canvas_1.ChartJSNodeCanvas({ width, height });
    const imageBuffer = await canvas.renderToBuffer(configuration);
    await (0, promises_2.writeFile)(outputPath, imageBuffer);
};
// Cosine distance between two vectors
function cosineDistance(a, b) {
    const dot = a.reduce((sum, val, i) => sum + val * b[i], 0);
    const normA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
    const normB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
    return 1 - dot / (normA * normB + 1e-8);
}
// Convert Float32Array[] (embeddings) to number[][] if needed
const tensorTo2DArray = async (tensor) => {
    const data = await tensor.array(); // shape: [T, D]
    return data;
};
const plotDTW = async (refEmbed, userEmbed, outputPath) => {
    const ref = await tensorTo2DArray(refEmbed);
    const user = await tensorTo2DArray(userEmbed);
    const dtw = new dynamic_time_warping_1.default(ref, user, cosineDistance);
    const distance = dtw.getDistance();
    const pathPts = dtw.getPath(); // Array of [x, y] alignment path
    const x = pathPts.map(([x]) => x);
    const y = pathPts.map(([, y]) => y);
    const width = 600;
    const height = 600;
    const chartJSNodeCanvas = new chartjs_node_canvas_1.ChartJSNodeCanvas({ width, height });
    const config = {
        type: "line",
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
    await (0, promises_2.writeFile)(outputPath, buffer);
};
const saveUserPronunciation = async ({ userId, pronuciationPlotUrl, recordingUrl, pronunciationId, }) => {
    const userPronunciationData = {
        id: (0, uuid_1.v4)(),
        userId,
        pronunciationId,
        recordingUrl,
        pronuciationPlotUrl,
    };
    return user_pronunciation_repository_1.default.addPronunciation(userPronunciationData);
};
const createFileDirectories = async ({ userfileName, masterFileName, reqFileName, }) => {
    const userRawFilePath = path_1.default.join(__dirname, "../utilities/audioFiles/uploads/raw", reqFileName);
    const paths = {
        userRawFilePath,
    };
    const userFilePaths = {
        userWavFilePath: "../utilities/audioFiles/uploads/wavs",
        userTrimmedFilePath: "../utilities/audioFiles/uploads/trimmed",
        normalisedUserWavPath: "../utilities/audioFiles/uploads/normalized",
    };
    for (let key in userFilePaths) {
        const directory = path_1.default.join(__dirname, userFilePaths[key]);
        await promises_1.default.mkdir(directory, { recursive: true });
        paths[key] = path_1.default.join(directory, `${userfileName}.wav`);
    }
    const masterFilePaths = {
        masterRawFilePath: "../utilities/audioFiles/master/raw",
        masterWavFilePath: "../utilities/audioFiles/master/wavs",
        masterTrimmedFilePath: "../utilities/audioFiles/master/trimmed",
        normalisedMasterWavPath: "../utilities/audioFiles/master/normalized",
    };
    for (let key in masterFilePaths) {
        const directory = path_1.default.join(__dirname, masterFilePaths[key]);
        await promises_1.default.mkdir(directory, { recursive: true });
        paths[key] = path_1.default.join(directory, `${masterFileName}.wav`);
    }
    const plotPaths = {
        plotPath: "../utilities/audioFiles/plots",
        plotDTWPath: "../utilities/audioFiles/plots",
    };
    for (let key in plotPaths) {
        const directory = path_1.default.join(__dirname, plotPaths[key]);
        await promises_1.default.mkdir(directory, { recursive: true });
        const suffix = key.split("Path")[0];
        paths[key] = path_1.default.join(directory, `${userfileName}_${suffix}.png`);
    }
    return paths;
};
exports.default = {
    comparePronounciation,
};
