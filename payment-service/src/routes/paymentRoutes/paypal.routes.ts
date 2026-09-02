import express from "express";
import { paypalControllers } from "../../controllers";
import { generalAuthFunction } from "../../../../shared/middleware/authorization.middleware";
import { JoiValidators } from "../../validations";

const router = express.Router();

router.post(
  "/create-order",
  JoiValidators.inputValidator(JoiValidators.stripeCreateCheckoutSessionSchema),
  generalAuthFunction,
  paypalControllers.createPayPalOrderController
);

router.post(
  "/capture-order",
  generalAuthFunction,
  paypalControllers.capturePayPalOrderController
);

router.post(
  "/cancel-subscription/:subscriptionId",
  generalAuthFunction,
  paypalControllers.cancelPayPalSubscriptionController
);

export default router;