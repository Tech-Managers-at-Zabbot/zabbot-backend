import Joi from "joi";
import { Request, Response, NextFunction } from "express";
import { token } from "morgan";

// const PASSWORD_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d\W]{8,}$/

const inputValidator = (schema: Joi.Schema): any => {
  return async (
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<any> => {
    try {
      const { error } = schema.validate(request.body);
      if (error) {
        return response.status(400).json({
          status: "error",
          message: `${error.details[0].message.replace(/["\\]/g, "")}`,
        });
      }
      return next();
    } catch (err) {
      return response.status(500).json({
        status: "error",
        message: "Internal Server Error",
      });
    }
  };
};

const userRegisterSchemaViaEmail = Joi.object({
  email: Joi.string()
    .trim()
    .email({ tlds: { allow: false } })
    .required()
    .messages({
      'string.empty': 'Email is required',
      'string.email': 'Email must be a valid email address',
    }),

  password: Joi.string()
    .trim()
    .min(8)
    .required()
    .messages({
      'string.empty': 'Password is required',
      'string.min': 'Password must be at least 8 characters long',
    }),

  confirmPassword: Joi.string()
    .trim()
    .required()
    .valid(Joi.ref('password'))
    .messages({
      'any.only': 'Passwords do not match',
      'string.empty': 'Confirm Password is required',
    }),

  firstName: Joi.string()
    .trim()
    .min(2)
    .required()
    .messages({
      'string.empty': 'First Name is required',
      'string.min': 'First Name must be at least 2 characters long',
    }),

  lastName: Joi.string()
    .trim()
    .min(2)
    .required()
    .messages({
      'string.empty': 'Last Name is required',
      'string.min': 'Last Name must be at least 2 characters long',
    }),

  role: Joi.string()
    .trim()
    .min(4)
    .optional(),
  timeZone: Joi.string().optional()
});

const loginUserSchema = Joi.object({
  email: Joi.string()
    .trim()
    .email({ tlds: { allow: false } })
    .required()
    .messages({
      'string.empty': 'Email is required',
      'string.email': 'Email must be a valid email address',
    }),

  password: Joi.string()
    .trim()
    .min(8)
    .required()
    .messages({
      'string.empty': 'Password is required',
      'string.min': 'Password must be at least 8 characters long',
    }),
    stayLoggedIn: Joi.boolean().truthy('true').falsy('false').optional(),
    timeZone: Joi.string().optional()

});

const resendVerificationLinkSchema = Joi.object({
  email: Joi.string()
    .trim()
    .email({ tlds: { allow: false } })
    .required()
    .messages({
      'string.empty': 'Email is required',
      'string.email': 'Email must be a valid email address',
    }),
});

const resetPasswordSchema = Joi.object({
  newPassword: Joi.string()
    .trim()
    .min(8)
    .required()
    .messages({
      'string.empty': 'Password is required',
      'string.min': 'Password must be at least 8 characters long',
    }),

  confirmNewPassword: Joi.string()
    .trim()
    .required()
    .valid(Joi.ref('newPassword'))
    .messages({
      'any.only': 'Passwords do not match',
      'string.empty': 'Confirm Password is required',
    }),
  token: Joi.string().trim().required().messages({
    'string.empty': 'Please click the link in your email again, if error persists, please request a new password reset link',
    'string.base': 'Please click the link in your email again, if error persists, please request a new password reset link',
  }),
})

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

export default {
  userRegisterSchemaViaEmail,
  loginUserSchema,
  // createPhraseSchema,
  inputValidator,
  resendVerificationLinkSchema,
  resetPasswordSchema
};
