"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cloudinary = void 0;
const multer_1 = __importDefault(require("multer"));
const multer_storage_cloudinary_1 = require("multer-storage-cloudinary");
const cloudinary_1 = require("cloudinary");
Object.defineProperty(exports, "cloudinary", { enumerable: true, get: function () { return cloudinary_1.v2; } });
const dotenv_1 = __importDefault(require("dotenv"));
const config_1 = __importDefault(require("../../../config/config"));
dotenv_1.default.config();
cloudinary_1.v2.config({
    cloud_name: config_1.default.EDEDUN_CLOUDINARY_NAME,
    api_key: config_1.default.EDEDUN_CLOUDINARY_API_KEY,
    api_secret: config_1.default.EDEDUN_CLOUDINARY_API_SECRET
});
const storage = new multer_storage_cloudinary_1.CloudinaryStorage({
    cloudinary: cloudinary_1.v2,
    params: async (req, file) => {
        try {
            if (!file)
                throw new Error("File is required");
            return {
                folder: "Ededun/Audio",
                resource_type: "raw",
                // For audio files specifically
                format: file.originalname.split('.').pop()
            };
        }
        catch (error) {
            console.error(`Cloudinary storage error: ${error.message}`);
            throw error.message;
        }
    }
});
const cloud = (0, multer_1.default)({
    storage: storage,
    fileFilter: (req, file, cb) => {
        try {
            if (file.mimetype.startsWith("audio/")) {
                cb(null, true);
            }
            else {
                console.error(`Invalid file type: ${file.mimetype}`);
                cb(null, false);
                return cb(new Error("Only audio formats are allowed"));
            }
        }
        catch (error) {
            console.error(`File filter error: ${error.message}`);
            cb(error);
        }
    },
    limits: {
        fileSize: 50 * 1024 * 1024
    }
}).fields([{ name: "audio", maxCount: 1 }]);
const upload = (req, res, next) => {
    cloud(req, res, (error) => {
        if (error instanceof multer_1.default.MulterError) {
            console.error(`Multer error: ${error.message}`);
            return res.status(400).json({ status: 'error', message: error.message });
        }
        else if (error) {
            console.error(`Upload error: ${error.message}`);
            return res.status(500).json({ status: 'error', message: error.message });
        }
        next();
    });
};
exports.default = upload;
