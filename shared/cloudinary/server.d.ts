import { MediaType, UploadResponse } from './types';
export declare class CloudinaryService {
    /**
     * Upload a single file
     */
    static uploadFile(buffer: Buffer, fileName: string, category: string, mediaType: MediaType): Promise<UploadResponse>;
    /**
     * Delete a single file
     */
    static deleteFile(publicId: string, mediaType: MediaType): Promise<void>;
    /**
     * Bulk delete files
     */
    static deleteFiles(publicIds: string[], mediaType: MediaType): Promise<void>;
    /**
     * Generate upload signature for client-side uploads
     */
    static generateUploadSignature(folder: string, mediaType: MediaType): {
        signature: string;
        timestamp: number;
        apiKey: any;
        cloudName: any;
        folder: string;
    };
}
