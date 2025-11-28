"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSignature = exports.uploadFile = void 0;
const server_1 = require("./server");
const uploadFile = async (category, mediaType, files) => {
    const uploadResponse = {
        status: "",
        message: "",
        data: {},
    };
    try {
        if (!["image", "video"].includes(mediaType)) {
            uploadResponse.status = "invalid";
            uploadResponse.message = "Invalid media type";
            return uploadResponse;
        }
        const result = {
            successful: [],
            failed: [],
        };
        for (const file of files) {
            try {
                const uploadResponse = await server_1.CloudinaryService.uploadFile(file.buffer, file.originalname, category, mediaType);
                result.successful.push(uploadResponse);
            }
            catch (error) {
                result.failed.push({
                    file: file.originalname,
                    error: error instanceof Error ? error.message : "Unknown error",
                });
            }
        }
        if (!result.successful.length) {
            uploadResponse.status = "error";
            uploadResponse.message = "Upload failed, please try again";
            uploadResponse.data = result;
            return uploadResponse;
        }
        if (!result.failed.length) {
            uploadResponse.status = "success";
            uploadResponse.message = "Process Successful";
            uploadResponse.data = result;
            return uploadResponse;
        }
        uploadResponse.status = "mixed";
        uploadResponse.message = "Process Partially Successful";
        uploadResponse.data = result;
        return uploadResponse;
    }
    catch (error) {
        console.log(error);
        uploadResponse.status = "error";
        uploadResponse.message =
            error instanceof Error
                ? error.message
                : "Upload failed, please try again";
        return uploadResponse;
    }
};
exports.uploadFile = uploadFile;
const getSignature = async (folder, mediaType) => {
    const signatureResponse = {
        status: "",
        message: "",
        data: {},
    };
    try {
        if (!folder || !mediaType) {
            signatureResponse.message = "Missing folder or mediaType";
            signatureResponse.status = "error";
            return signatureResponse;
        }
        const signature = server_1.CloudinaryService.generateUploadSignature(folder, mediaType);
        signatureResponse.message = "Successful";
        signatureResponse.status = "success";
        signatureResponse.data = signature;
        return signatureResponse;
    }
    catch (error) {
        signatureResponse.message =
            error instanceof Error ? error.message : "Token generation failed";
        signatureResponse.status = "error";
        return signatureResponse;
    }
};
exports.getSignature = getSignature;
