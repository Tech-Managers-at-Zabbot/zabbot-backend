export declare const fetchEdedunLanguage: (englishText?: string, yorubaText?: string) => Promise<{
    success: boolean;
    statusCode: number;
    data: any;
    message: any;
} | {
    success: boolean;
    statusCode: any;
    data: null;
    message: any;
}>;
export declare const fetchEdedunLanguageBatches: (wordArr: Record<string, any>[]) => Promise<{
    success: boolean;
    statusCode: number;
    data: any;
    message: any;
} | {
    success: boolean;
    statusCode: any;
    data: null;
    message: any;
}>;
export declare const fetchSingleUser: (userId: string, projection?: string[]) => Promise<{
    success: boolean;
    statusCode: number;
    data: any;
    message: any;
} | {
    success: boolean;
    statusCode: any;
    data: null;
    message: any;
}>;
