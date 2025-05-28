import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';
import { SendgridListTypes, SendgridListName } from "../../constants/enums";

const inputValidator = (schema: Joi.Schema): any => {
  return async (request: Request, response: Response, next: NextFunction): Promise<any> => {
    try {
      const { error } = schema.validate(request.body.body);
 if (error) {
        return response.status(400).json({
          status: 'error',
          message: `${error.details[0].message.replace(/["\\]/g, '')}`,
        });
      }
      return next();
    } catch (error: any) {
      console.error(`Error from Joi Validator: ${error.message}`)
      return response.status(500).json({
        status: 'error',
        message: `Internal Server Error`,
      });
    }
  };
};

export const addCustomFieldSchema = Joi.object({
  fieldName: Joi.string()
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

  fieldType: Joi.string()
    .valid(...Object.values(SendgridListTypes))
    .required()
    .messages({
      'any.only': 'Field type can either be Text, Number or Date',
      'string.base': 'Field Type must be a string',
      'string.empty': 'Field Type is required',
    }),

  listName: Joi.string()
    .valid(...Object.values(SendgridListName))
    .required()
    .messages({
      'any.only': 'Please select a valid List Name',
      'string.base': 'List Name must be a string',
      'string.empty': 'List Name is required',
    }),
});

export const addToSendgridListSchema = Joi.object({
  email: Joi.string()
    .email()
    .trim()
    .max(40)
    .required()
    .messages({
      'string.empty': 'Email is required',
      'string.email': 'Email is required',
      'any.required': 'Email is required',
    }),
  firstName: Joi.string()
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
  lastName: Joi.string()
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
  country: Joi.string()
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

export default {
  addCustomFieldSchema,
  addToSendgridListSchema,
  inputValidator,
}