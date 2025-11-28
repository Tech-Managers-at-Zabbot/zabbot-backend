export type MediaType = 'image' | 'video';
export interface UploadResponse {
    public_id: string;
    url: string;
    secure_url: string;
    type: MediaType;
    size: number;
    width?: number;
    height?: number;
}
export interface BulkUploadResponse {
    successful: UploadResponse[];
    failed: Array<{
        file: string;
        error: string;
    }>;
}
export interface DeleteRequest {
    publicIds: string[];
    mediaType: MediaType;
}
