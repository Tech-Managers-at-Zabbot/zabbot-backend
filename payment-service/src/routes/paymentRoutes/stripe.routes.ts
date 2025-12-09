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

router.post("/webhook", express.raw({ type: "application/json" }), stripeControllers.stripeWebhookController)
// localhost:3010/api/v1/payments/payment-services/stripe/webhook

export default router;
