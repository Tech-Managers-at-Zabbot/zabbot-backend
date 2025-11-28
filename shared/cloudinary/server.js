"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CloudinaryService = void 0;
const cloudinary_1 = require("cloudinary");
cloudinary_1.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});
class CloudinaryService {
    /**
     * Upload a single file
     */
    static async uploadFile(buffer, fileName, category, mediaType) {
        try {
            const folder = `${mediaType}/${category}`;
            const publicId = `${folder}/${fileName.split('.')[0]}-${Date.now()}`;
            const result = await new Promise((resolve, reject) => {
                const uploadStream = cloudinary_1.v2.uploader.upload_stream({
                    public_id: publicId,
                    folder,
                    resource_type: mediaType === 'video' ? 'video' : 'image',
                    quality: 'auto',
                    fetch_format: 'auto',
                    transformation: mediaType === 'image'
                        ? [{ quality: 'auto', fetch_format: 'auto' }]
                        : undefined,
                }, (error, result) => {
                    if (error)
                        reject(error);
                    else
                        resolve(result);
                });
                uploadStream.end(buffer);
            });
            return {
                public_id: result.public_id,
                url: result.url,
                secure_url: result.secure_url,
                type: mediaType,
                size: result.bytes,
                width: result.width,
                height: result.height,
            };
        }
        catch (error) {
            throw new Error(`Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
     * Delete a single file
     */
    static async deleteFile(publicId, mediaType) {
        try {
            await cloudinary_1.v2.uploader.destroy(publicId, {
                resource_type: mediaType === 'video' ? 'video' : 'image',
            });
        }
        catch (error) {
            throw new Error(`Delete failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
     * Bulk delete files
     */
    static async deleteFiles(publicIds, mediaType) {
        try {
            if (publicIds.length === 0)
                return;
            await cloudinary_1.v2.api.delete_resources(publicIds, {
                resource_type: mediaType === 'video' ? 'video' : 'image',
            });
        }
        catch (error) {
            throw new Error(`Bulk delete failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
     * Generate upload signature for client-side uploads
     */
    static generateUploadSignature(folder, mediaType) {
        const timestamp = Math.floor(Date.now() / 1000);
        const uploadFolder = `${mediaType}/${folder}`;
        const signature = cloudinary_1.v2.utils.api_sign_request({
            timestamp,
            folder: uploadFolder,
            resource_type: mediaType === 'video' ? 'video' : 'image',
        }, process.env.CLOUDINARY_API_SECRET);
        return {
            signature,
            timestamp,
            apiKey: process.env.CLOUDINARY_API_KEY,
            cloudName: process.env.CLOUDINARY_CLOUD_NAME,
            folder: uploadFolder,
        };
    }
}
exports.CloudinaryService = CloudinaryService;
