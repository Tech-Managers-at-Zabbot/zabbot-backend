const fs = require("fs");
const path = require("path");

const src = path.resolve(__dirname, "../src/utilities/whisperEncoder.onnx");
const destDir = path.resolve(__dirname, "../dist/utilities");
const dest = path.join(destDir, "whisperEncoder.onnx");

fs.mkdirSync(destDir, { recursive: true });
fs.copyFileSync(src, dest);

console.log("Model file copied to dist/utilities");
