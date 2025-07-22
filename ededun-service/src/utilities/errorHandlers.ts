import { Request, Response, NextFunction, ErrorRequestHandler } from 'express';

const createError = (message: string, statusCode: number) => ({
    message,
    statusCode,
    timestamp: new Date(),
    isOperational: true,
  });
  
  export const createUnknownError = (error: Error) => ({
    message: `Something went wrong: ${error.message}`,
    statusCode: 500,
    timestamp: new Date(),
    details: error.message,
    isOperational: false
  });



const withErrorHandling = (fn: Function) => async (...args: any) => {
    try {
      return await fn(...args);
    } catch (error: any) {

      if (error.isOperational) {
        return createError(error.message, error.statusCode);
      }
      console.log('err',error.message)
      return createUnknownError(error);
    }
  };


  const globalErrorHandler: ErrorRequestHandler = (err: any, req: Request, res: Response, next: NextFunction):any => {
    const errorResponse = err.isOperational ? err : createUnknownError(err);
    return res.status(errorResponse.statusCode).json({
      status: "error",
      message: errorResponse.message,
      timestamp: errorResponse.timestamp,
      details: !err.isOperational ? `${err.message}` : ""
    });
};

export default {
    createError,
    createUnknownError,
    withErrorHandling,
    globalErrorHandler
}
  
  