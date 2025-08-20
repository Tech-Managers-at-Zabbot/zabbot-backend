"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createUnknownError = void 0;
const createError = (message, statusCode) => ({
    message,
    statusCode,
    timestamp: new Date(),
    isOperational: true,
});
const createUnknownError = (error) => ({
    message: `Something went wrong: ${error.message}`,
    statusCode: 500,
    timestamp: new Date(),
    details: error.message,
    isOperational: false
});
exports.createUnknownError = createUnknownError;
const withErrorHandling = (fn) => async (...args) => {
    try {
        return await fn(...args);
    }
    catch (error) {
        if (error.isOperational) {
            return createError(error.message, error.statusCode);
        }
        console.log('err', error.message);
        return (0, exports.createUnknownError)(error);
    }
};
const globalErrorHandler = (err, req, res, next) => {
    const errorResponse = err.isOperational ? err : (0, exports.createUnknownError)(err);
    return res.status(errorResponse.statusCode).json({
        status: "error",
        message: errorResponse.message,
        timestamp: errorResponse.timestamp,
        details: !err.isOperational ? `${err.message}` : ""
    });
};
exports.default = {
    createError,
    createUnknownError: exports.createUnknownError,
    withErrorHandling,
    globalErrorHandler
};
