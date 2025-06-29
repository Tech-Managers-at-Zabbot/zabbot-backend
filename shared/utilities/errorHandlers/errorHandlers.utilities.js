"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.globalErrorHandler = exports.createUnknownError = void 0;
const createError = (message, statusCode, specialCodeMessage) => ({
    message,
    statusCode,
    specialCodeMessage,
    timestamp: new Date(),
    isOperational: true,
});
const createUnknownError = (error) => ({
    message: `Something went wrong: ${error.message || 'Unknown error'}`,
    statusCode: error.statusCode || 500,
    timestamp: new Date(),
    details: error.stack || error.message,
    isOperational: false,
});
exports.createUnknownError = createUnknownError;
const withControllerErrorHandling = (fn) => {
    return async (req, res, next) => {
        try {
            await fn(req, res, next);
        }
        catch (error) {
            next(error);
        }
    };
};
const withServiceErrorHandling = (fn) => {
    return async (...args) => {
        try {
            return await fn(...args);
        }
        catch (error) {
            console.error('Service error:', error.message);
            throw error;
        }
    };
};
const globalErrorHandler = (err, req, res, next) => {
    const errorResponse = err.isOperational ? err : (0, exports.createUnknownError)(err);
    console.error('❌ Error:', errorResponse.details || err);
    return res.status(errorResponse.statusCode).json({
        status: 'error',
        message: errorResponse.message,
        timestamp: errorResponse.timestamp,
        specialCodeMessage: errorResponse?.specialCodeMessage,
        details: !err.isOperational ? errorResponse.details : '',
    });
};
exports.globalErrorHandler = globalErrorHandler;
const processErrorHandler = () => {
    process.on('uncaughtException', (err) => {
        console.error('💥 UNCAUGHT EXCEPTION:', err);
        process.exit(1);
    });
    process.on('unhandledRejection', (reason, promise) => {
        console.error('💥 UNHANDLED REJECTION:', reason);
    });
};
exports.default = {
    createError,
    createUnknownError: exports.createUnknownError,
    withServiceErrorHandling,
    withControllerErrorHandling,
    globalErrorHandler: exports.globalErrorHandler,
    processErrorHandler
};
