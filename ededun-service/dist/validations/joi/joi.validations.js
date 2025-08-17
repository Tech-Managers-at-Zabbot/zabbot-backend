"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const joi_1 = __importDefault(require("joi"));
// const PASSWORD_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d\W]{8,}$/
const inputValidator = (schema) => {
    return async (request, response, next) => {
        try {
            const { error } = schema.validate(request.body);
            if (error) {
                return response.status(400).json({
                    status: "error",
                    message: `${error.details[0].message.replace(/["\\]/g, "")}`,
                });
            }
            return next();
        }
        catch (err) {
            return response.status(500).json({
                status: "error",
                message: "Internal Server Error",
            });
        }
    };
};
const userRegisterSchemaViaEmail = joi_1.default.object({
    email: joi_1.default.string().trim().email().required().messages({
        "string.email": "Email is required",
    }),
    password: joi_1.default.string().trim().min(8).required().messages({
        "string.base": "Password is required",
    }),
    firstName: joi_1.default.string().trim().required().messages({
        "string.base": "First Name is required",
    }),
    lastName: joi_1.default.string().trim().required().messages({
        "string.base": "Last Name is required",
    }),
    phone: joi_1.default.string().trim().required().messages({
        "string.base": "Phone Number is required",
    }),
    gender: joi_1.default.string().trim().required().messages({
        "string.base": "Gender is required",
    }),
    ageGroup: joi_1.default.string().trim().required().messages({
        "string.base": "Please select your appropriate age group",
    }),
});
const loginUserSchemaViaEmail = joi_1.default.object({
    email: joi_1.default.string().trim().required().email().messages({
        "string.email": "Email is required",
    }),
    password: joi_1.default.string().trim().required().messages({
        "string.base": "password is required",
    }),
});
const createPhraseSchema = joi_1.default.object({
    english_text: joi_1.default.string().trim().required().messages({
        "string.base": "The English Phrase is required",
    }),
    pronounciation_note: joi_1.default.string().trim().optional(),
    phrase_category: joi_1.default.string().trim().required().messages({
        "string.base": "The Phrase Category is required",
    }),
    yoruba_text: joi_1.default.string().trim().required().messages({
        "string.base": "The Yoruba Phrase is required",
    }),
});
exports.default = {
    userRegisterSchemaViaEmail,
    loginUserSchemaViaEmail,
    createPhraseSchema,
    inputValidator,
};
