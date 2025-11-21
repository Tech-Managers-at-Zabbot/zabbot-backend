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


export default {
  stripeCreateCheckoutSessionSchema,
  inputValidator,
};
