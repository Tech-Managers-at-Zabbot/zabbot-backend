export declare const uploadFile: (category: string, mediaType: string, files: Record<string, any>[]) => Promise<{
    status: string;
    message: string;
    data: {};
}>;
export declare const getSignature: (folder: any, mediaType: any) => Promise<{
    status: string;
    message: string;
    data: {};
}>;
