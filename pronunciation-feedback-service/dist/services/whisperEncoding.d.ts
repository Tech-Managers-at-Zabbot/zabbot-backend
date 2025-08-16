import * as tf from "@tensorflow/tfjs";
/**
 * Calculates the audio embedding using a local ONNX model.
 *
 * @param audioFilePath The path to the input audio file.
 * @returns A promise that resolves to the audio embedding as a Float32Array.
 */
export declare const getEmbedding: (audioFilePath: string) => Promise<tf.Tensor2D>;
