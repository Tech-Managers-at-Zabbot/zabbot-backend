import fs from "fs";
import path from "path";
import * as ort from "onnxruntime-node"; // ONNX Runtime for Node.js
import * as audio from "node-wav"; // Library to read WAV files
import FFT from "fft.js"; // A simple and popular FFT library for Node.js
import * as tf from "@tensorflow/tfjs";

// ============================================================================
// PART 1: PREPROCESSING HELPERS
// These functions convert raw audio to a log-Mel spectrogram, which is the
// required input for the Whisper ONNX encoder.
//
// NOTE: This code now uses the "fft.js" library.
// To use this, you must first install the package: `npm install fft.js`
// ============================================================================

/**
 * Creates a mel filterbank, a matrix used to convert a spectrogram to a mel spectrogram.
 * This is a direct implementation of the Whisper's audio preprocessing logic.
 * @param sampleRate The audio sample rate (e.g., 16000).
 * @param nfft The number of FFT points.
 * @param nmel The number of mel bands.
 * @returns A 2D array representing the mel filterbank.
 */
const getMelFilterbank = (
  sampleRate: number,
  nfft: number,
  nmel: number
): number[][] => {
  const fmin = 0;
  const fmax = sampleRate / 2;
  const mel = (f: number) => 1125 * Math.log(1 + f / 700);
  const invMel = (m: number) => 700 * (Math.exp(m / 1125) - 1);

  const mel_points = Array.from(
    { length: nmel + 2 },
    (_, i) => mel(fmin) + ((mel(fmax) - mel(fmin)) * i) / (nmel + 1)
  );

  const hz_points = mel_points.map(invMel);

  const bin_points = hz_points.map((hz) =>
    Math.floor((nfft * hz) / sampleRate)
  );

  const filterbank: number[][] = Array.from({ length: nmel }, () =>
    Array(Math.floor(nfft / 2) + 1).fill(0)
  );
  for (let i = 0; i < nmel; i++) {
    const f_left = bin_points[i];
    const f_center = bin_points[i + 1];
    const f_right = bin_points[i + 2];

    for (let j = f_left; j < f_center; j++) {
      filterbank[i][j] = (j - f_left) / (f_center - f_left);
    }
    for (let j = f_center; j < f_right; j++) {
      filterbank[i][j] = (f_right - j) / (f_right - f_center);
    }
  }

  return filterbank;
};

/**
 * Converts a raw audio signal into a log-Mel spectrogram.
 * This is the crucial preprocessing step that prepares the audio for the model.
 * @param audioData The raw PCM audio data as a Float32Array.
 * @param sampleRate The audio sample rate.
 * @returns A Float32Array of the log-Mel spectrogram, reshaped for the ONNX model.
 */
const logMelSpectrogram = (
  audioData: Float32Array,
  sampleRate: number
): Float32Array => {
  // Constants from the Whisper paper
  const n_fft = 512; // Number of FFT points (25ms window at 16kHz)
  const hop_length = 160; // Hop length (10ms window at 16kHz)
  const n_mel = 80; // Number of mel bands for the base model
  const n_frames = 3000; // Total frames for a 30s audio segment

  // Pad the audio to 30 seconds if it's shorter
  const requiredLength = sampleRate * 30;
  let paddedAudio = audioData;
  if (audioData.length < requiredLength) {
    paddedAudio = new Float32Array(requiredLength).fill(0);
    paddedAudio.set(audioData);
  } else {
    // Trim if it's longer
    paddedAudio = audioData.slice(0, requiredLength);
  }

  // --- Hanning window function ---
  const hannWindow = (i: number, size: number) =>
    0.5 * (1 - Math.cos((2 * Math.PI * i) / (size - 1)));

  const num_hops = Math.floor((paddedAudio.length - n_fft) / hop_length) + 1;

  // Create the mel filterbank
  const melFilterbank = getMelFilterbank(sampleRate, n_fft, n_mel);
  const mel_spectrogram = new Float32Array(n_mel * n_frames).fill(0);

  const fft = new FFT(n_fft);
  const out = fft.createComplexArray();

  for (let i = 0; i < num_hops; i++) {
    // Extract a window of audio data
    const windowedData = new Float32Array(n_fft);
    for (let j = 0; j < n_fft; j++) {
      const sample = paddedAudio[i * hop_length + j];
      windowedData[j] = sample * hannWindow(j, n_fft);
    }

    // Perform FFT
    fft.realTransform(out, windowedData);

    // Calculate the power spectrum (magnitude squared)
    const powerSpectrum = new Float32Array(n_fft / 2 + 1);
    for (let j = 0; j < powerSpectrum.length; j++) {
      const real = out[j * 2];
      const imag = out[j * 2 + 1];
      powerSpectrum[j] = real * real + imag * imag;
    }

    // Apply the mel filterbank to get the mel spectrogram values
    for (let m = 0; m < n_mel; m++) {
      let sum = 0;
      for (let j = 0; j < powerSpectrum.length; j++) {
        sum += melFilterbank[m][j] * powerSpectrum[j];
      }
      mel_spectrogram[m * n_frames + i] = sum;
    }
  }

  // Apply log scale
  const log_mel_spectrogram = mel_spectrogram.map((v) =>
    Math.log10(Math.max(v, 1e-10))
  );

  return log_mel_spectrogram;
};

// ============================================================================
// PART 2: THE MAIN FUNCTION TO GET THE EMBEDDING
// This function ties together the preprocessing and the ONNX model inference.
// ============================================================================

/**
 * Calculates the audio embedding using a local ONNX model.
 *
 * @param audioFilePath The path to the input audio file.
 * @returns A promise that resolves to the audio embedding as a Float32Array.
 */
export const getEmbedding = async (
  audioFilePath: string
): Promise<tf.Tensor2D> => {
  // Assume the ONNX model is in the same directory as this script.
  const onnxModelPath = path.join(
    __dirname,
    "../utilities/whisperEncoder.onnx"
  );

  try {
    // 1. Load the ONNX model session
    const session = await ort.InferenceSession.create(onnxModelPath);

    // 2. Read and decode the audio file using node-wav
    const file = await fs.promises.readFile(audioFilePath);
    const audioData = audio.decode(file);

    // Use the first channel's data (assuming mono audio)
    const audioBuffer = audioData.channelData[0];

    // 3. Preprocess the audio into a log-Mel spectrogram
    const spectrogram = logMelSpectrogram(audioBuffer, audioData.sampleRate);

    // The ONNX model expects a tensor of shape [1, 80, 3000].
    const inputShape = [1, 80, 3000];

    // 4. Create the input tensor for the ONNX model
    const inputTensor = new ort.Tensor("float32", spectrogram, inputShape);

    // 5. Run the inference session
    const feeds = { mel_spectrogram: inputTensor };
    const results = await session.run(feeds);

    // ONNX output: shape [1, frames, embedding_dim]
    const embeddingFlat = results.audio_embedding.data as Float32Array;

    // Infer the correct shape
    const frames = results.audio_embedding.dims[1];
    const dims: [number, number] = [frames, 512]; // Whisper base model output is [1, frames, 512]

    // Reshape into 2D tensor for similarity comparison
    const embedding = tf.tensor2d(embeddingFlat, dims);

    return embedding;
  } catch (error) {
    console.error("An error occurred during embedding generation:", error);
    throw error;
  }
};
