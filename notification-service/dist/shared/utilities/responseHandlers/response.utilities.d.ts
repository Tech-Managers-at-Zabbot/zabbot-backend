import { Response } from "express";
export interface ResponseDetails {
    message: string;
    statusCode: number;
    data?: any;
    details?: any;
    info?: any;
}
declare const _default: {
    responseHandler: (response: Response, message: string, statusCode: number, data?: any, details?: any, info?: any) => Response<any, Record<string, any>>;
    handleServicesResponse: (statusCode: number, message: string, data?: any) => ResponseDetails;
};
export default _default;
