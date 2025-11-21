import express from "express";
import { stripeControllers } from "../../controllers";
import { generalAuthFunction } from "../../../../shared/middleware/authorization.middleware";
import { JoiValidators } from "../../validations";

const router = express.Router();

router.post(
  "/create-checkout-session",
  JoiValidators.inputValidator(JoiValidators.stripeCreateCheckoutSessionSchema),
  generalAuthFunction,
  stripeControllers.createCheckoutSessionController
);

export default router;
