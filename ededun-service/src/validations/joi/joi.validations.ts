import Joi from "joi";
import { Request, Response, NextFunction } from "express";

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
  email: Joi.string().trim().email().required().messages({
    "string.email": "Email is required",
  }),

  password: Joi.string().trim().min(8).required().messages({
    "string.base": "Password is required",
  }),

  firstName: Joi.string().trim().required().messages({
    "string.base": "First Name is required",
  }),

  lastName: Joi.string().trim().required().messages({
    "string.base": "Last Name is required",
  }),

  phone: Joi.string().trim().required().messages({
    "string.base": "Phone Number is required",
  }),

  gender: Joi.string().trim().required().messages({
    "string.base": "Gender is required",
  }),

  ageGroup: Joi.string().trim().required().messages({
    "string.base": "Please select your appropriate age group",
  }),
});

const loginUserSchemaViaEmail = Joi.object({
  email: Joi.string().trim().required().email().messages({
    "string.email": "Email is required",
  }),

  password: Joi.string().trim().required().messages({
    "string.base": "password is required",
  }),
});

const createPhraseSchema = Joi.object({
  english_text: Joi.string().trim().required().messages({
    "string.base": "The English Phrase is required",
  }),
  
  pronounciation_note: Joi.string().trim().optional(),

  phrase_category: Joi.string().trim().required().messages({
    "string.base": "The Phrase Category is required",
  }),

  yoruba_text: Joi.string().trim().required().messages({
    "string.base": "The Yoruba Phrase is required",
  }),

});

export default {
  userRegisterSchemaViaEmail,
  loginUserSchemaViaEmail,
  createPhraseSchema,
  inputValidator,
};
