import { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
export interface CustomError extends Error {
    status?: number;
    code?: string;
}
export declare const createUnknownError: (error: any) => {
    message: string;
    statusCode: any;
    timestamp: Date;
    details: any;
    isOperational: boolean;
};
export declare const globalErrorHandler: ErrorRequestHandler;
declare const _default: {
    createError: (message: string, statusCode: number) => {
        message: string;
        statusCode: number;
        timestamp: Date;
        isOperational: boolean;
    };
    createUnknownError: (error: any) => {
        message: string;
        statusCode: any;
        timestamp: Date;
        details: any;
        isOperational: boolean;
    };
    withServiceErrorHandling: (fn: (...args: any[]) => Promise<any>) => (...args: any[]) => Promise<any>;
    withControllerErrorHandling: (fn: (...args: any[]) => Promise<any>) => (req: Request, res: Response, next: NextFunction) => Promise<void>;
    globalErrorHandler: ErrorRequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
    processErrorHandler: () => void;
};
export default _default;
