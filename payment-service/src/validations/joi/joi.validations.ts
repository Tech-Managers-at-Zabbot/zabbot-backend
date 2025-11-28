import Joi from "joi";
import { Request, Response, NextFunction } from "express";

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

const stripeCreateCheckoutSessionSchema = Joi.object({
  subscriptionType: Joi.string()
    .valid("monthly", "annual", "lifetime")
    .required()
    .messages({
      'any.only': 'Subscription Type must be one of monthly subscription, annual subscription, or lifetime subscription',
      'string.empty': 'Subscription Type is required',
    }),
});


const createTransactionSchema = Joi.object({
  amount: Joi.number()
    .positive()
    .required()
    .messages({
      "number.base": "Amount must be a valid number",
      "number.positive": "Amount must be greater than 0",
      "any.required": "Amount is required",
    }),

  planType: Joi.string()
    .valid("lifetime", "annual", "monthly")
    .required()
    .messages({
      "any.only": "Plan type must be one of: basic, pro, premium",
      "string.empty": "Plan type is required",
      "any.required": "Plan type is required",
    }),

  status: Joi.string()
    .valid("pending", "success", "failed")
    .required()
    .messages({
      "any.only": "Status must be one of: pending, success, failed",
      "string.empty": "Status is required",
      "any.required": "Status is required",
    }),
});


export default {
  stripeCreateCheckoutSessionSchema,
  createTransactionSchema,
  inputValidator,
};
