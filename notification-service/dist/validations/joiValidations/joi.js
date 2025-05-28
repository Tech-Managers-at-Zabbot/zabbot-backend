"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addToSendgridListSchema = exports.addCustomFieldSchema = void 0;
const joi_1 = __importDefault(require("joi"));
const enums_1 = require("../../constants/enums");
const inputValidator = (schema) => {
    return async (request, response, next) => {
        try {
            const { error } = schema.validate(request.body.body);
            if (error) {
                return response.status(400).json({
                    status: 'error',
                    message: `${error.details[0].message.replace(/["\\]/g, '')}`,
                });
            }
            return next();
        }
        catch (error) {
            console.error(`Error from Joi Validator: ${error.message}`);
            return response.status(500).json({
                status: 'error',
                message: `Internal Server Error`,
            });
        }
    };
};
exports.addCustomFieldSchema = joi_1.default.object({
    fieldName: joi_1.default.string()
        .trim()
        .min(4)
        .max(90)
        .required()
        .messages({
        'string.base': 'Field Name must be a string',
        'string.empty': 'Field Name is required',
        'string.min': 'Field Name should be at least 4 characters',
        'string.max': 'Field Name should not exceed 90 characters',
    }),
    fieldType: joi_1.default.string()
        .valid(...Object.values(enums_1.SendgridListTypes))
        .required()
        .messages({
        'any.only': 'Field type can either be Text, Number or Date',
        'string.base': 'Field Type must be a string',
        'string.empty': 'Field Type is required',
    }),
    listName: joi_1.default.string()
        .valid(...Object.values(enums_1.SendgridListName))
        .required()
        .messages({
        'any.only': 'Please select a valid List Name',
        'string.base': 'List Name must be a string',
        'string.empty': 'List Name is required',
    }),
});
exports.addToSendgridListSchema = joi_1.default.object({
    email: joi_1.default.string()
        .email()
        .trim()
        .max(40)
        .required()
        .messages({
        'string.empty': 'Email is required',
        'string.email': 'Email is required',
        'any.required': 'Email is required',
    }),
    firstName: joi_1.default.string()
        .trim()
        .min(2)
        .max(40)
        .required()
        .messages({
        'string.empty': 'First Name is required',
        'string.min': 'First Name should be at least 2 characters',
        'string.max': 'First name should not exceed 40 characters',
        'any.required': 'First Name is required',
    }),
    lastName: joi_1.default.string()
        .trim()
        .min(2)
        .max(40)
        .required()
        .messages({
        'string.empty': 'Last Name is required',
        'string.min': 'Last Name should be at least 2 characters',
        'string.max': 'Last Name should not exceed 40 characters',
        'any.required': 'Last Name is required',
    }),
    country: joi_1.default.string()
        .trim()
        .min(4)
        .max(60)
        .required()
        .messages({
        'string.empty': 'Country is required',
        'string.min': 'Country should be at least 4 characters',
        'string.max': 'Country should not exceed 60 characters',
        'any.required': 'Country is required',
    }),
});
exports.default = {
    addCustomFieldSchema: exports.addCustomFieldSchema,
    addToSendgridListSchema: exports.addToSendgridListSchema,
    inputValidator,
};
