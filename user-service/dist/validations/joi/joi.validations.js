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
    email: joi_1.default.string()
        .trim()
        .email({ tlds: { allow: false } })
        .required()
        .messages({
        'string.empty': 'Email is required',
        'string.email': 'Email must be a valid email address',
    }),
    password: joi_1.default.string()
        .trim()
        .min(8)
        .required()
        .messages({
        'string.empty': 'Password is required',
        'string.min': 'Password must be at least 8 characters long',
    }),
    confirmPassword: joi_1.default.string()
        .trim()
        .required()
        .valid(joi_1.default.ref('password'))
        .messages({
        'any.only': 'Passwords do not match',
        'string.empty': 'Confirm Password is required',
    }),
    firstName: joi_1.default.string()
        .trim()
        .min(2)
        .required()
        .messages({
        'string.empty': 'First Name is required',
        'string.min': 'First Name must be at least 2 characters long',
    }),
    lastName: joi_1.default.string()
        .trim()
        .min(2)
        .required()
        .messages({
        'string.empty': 'Last Name is required',
        'string.min': 'Last Name must be at least 2 characters long',
    }),
    role: joi_1.default.string()
        .trim()
        .min(4)
        .optional(),
    timeZone: joi_1.default.string().optional()
});
const loginUserSchema = joi_1.default.object({
    email: joi_1.default.string()
        .trim()
        .email({ tlds: { allow: false } })
        .required()
        .messages({
        'string.empty': 'Email is required',
        'string.email': 'Email must be a valid email address',
    }),
    password: joi_1.default.string()
        .trim()
        .min(8)
        .required()
        .messages({
        'string.empty': 'Password is required',
        'string.min': 'Password must be at least 8 characters long',
    }),
    stayLoggedIn: joi_1.default.boolean().truthy('true').falsy('false').optional(),
    timeZone: joi_1.default.string().optional()
});
const resendVerificationLinkSchema = joi_1.default.object({
    email: joi_1.default.string()
        .trim()
        .email({ tlds: { allow: false } })
        .required()
        .messages({
        'string.empty': 'Email is required',
        'string.email': 'Email must be a valid email address',
    }),
});
const resetPasswordSchema = joi_1.default.object({
    newPassword: joi_1.default.string()
        .trim()
        .min(8)
        .required()
        .messages({
        'string.empty': 'Password is required',
        'string.min': 'Password must be at least 8 characters long',
    }),
    confirmNewPassword: joi_1.default.string()
        .trim()
        .required()
        .valid(joi_1.default.ref('newPassword'))
        .messages({
        'any.only': 'Passwords do not match',
        'string.empty': 'Confirm Password is required',
    }),
    token: joi_1.default.string().trim().required().messages({
        'string.empty': 'Please click the link in your email again, if error persists, please request a new password reset link',
        'string.base': 'Please click the link in your email again, if error persists, please request a new password reset link',
    }),
});
// const createPhraseSchema = Joi.object({
//   english_text: Joi.string().trim().required().messages({
//     "string.base": "The English Phrase is required",
//   }),
//   pronounciation_note: Joi.string().trim().optional(),
//   phrase_category: Joi.string().trim().required().messages({
//     "string.base": "The Phrase Category is required",
//   }),
//   yoruba_text: Joi.string().trim().required().messages({
//     "string.base": "The Yoruba Phrase is required",
//   }),
// });
exports.default = {
    userRegisterSchemaViaEmail,
    loginUserSchema,
    // createPhraseSchema,
    inputValidator,
    resendVerificationLinkSchema,
    resetPasswordSchema
};
