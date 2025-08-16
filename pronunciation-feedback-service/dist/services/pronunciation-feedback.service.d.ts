import * as tf from "@tensorflow/tfjs";
export declare const loadAndTrimAudio: ({ trimmedFilePath, wavFilePath, rawFilePath, }: {
    trimmedFilePath: string;
    rawFilePath: string;
    wavFilePath: string;
}) => Promise<{
    tensor: tf.Tensor;
    raw: Float32Array;
}>;
declare const _default: {
    comparePronounciation: (...args: any[]) => Promise<any>;
};
export default _default;
