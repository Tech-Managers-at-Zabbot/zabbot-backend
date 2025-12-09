import express from "express";
import { subscriptionControllers } from "../../controllers";
import { generalAuthFunction } from "../../../../shared/middleware/authorization.middleware";
import { JoiValidators } from "../../validations";

const router = express.Router();

router.post(
  "/create-subscription-plan",
  JoiValidators.inputValidator(JoiValidators.createSubscriptionPlanSchema),
  //   generalAuthFunction,
  subscriptionControllers.createSubscriptionController
);

router.get(
  "/user-subscription",
  generalAuthFunction,
  subscriptionControllers.getUserSubscriptionController
);

export default router;
