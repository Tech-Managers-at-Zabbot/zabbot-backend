"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const responseHandler = (response, message, statusCode, data, details, info) => {
    return response.status(statusCode).json({
        status: statusCode === 201 || statusCode === 200 || statusCode === 207
            ? "success"
            : "error",
        message: message,
        data: data || null,
        details,
        info,
    });
};
const handleServicesResponse = (statusCode, message, data) => {
    const responseHandler = {
        statusCode: 0,
        message: "",
        data: {},
    };
    responseHandler.message = message;
    responseHandler.statusCode = statusCode;
    responseHandler.data = data;
    return responseHandler;
};
exports.default = {
    responseHandler,
    handleServicesResponse,
};
