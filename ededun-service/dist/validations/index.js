"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.joiValidators = exports.requestBodyValidator = void 0;
const joi_validations_1 = __importDefault(require("./joi/joi.validations"));
exports.joiValidators = joi_validations_1.default;
const requestBodyValidator = (schema) => {
    return (request, response, next) => {
        const { error } = schema.validate(request.body);
        if (error) {
            return response.status(400).json({
                status: 'error',
                message: `${error.details[0].message.replace(/["\\]/g, '')}`,
            });
        }
        next();
    };
};
exports.requestBodyValidator = requestBodyValidator;
