import express from "express";
import { quizController } from "../controllers";
import {
  generalAuthFunction,
  rolePermit,
} from "../../../shared/middleware/authorization.middleware";
import { JoiValidators } from "../validations";

import { requirePremiumEntitlement } from "../../../shared/subscription-gating/requirePremiumEntitlement";
const enforce = process.env.ZABBOT_SUBSCRIPTION_GATING_ENFORCE === "true";
const router = express.Router();

router.post(
  "/create-quiz",
  JoiValidators.inputValidator(JoiValidators.createQuizSchema),
  generalAuthFunction,
  rolePermit(["admin"]),
  quizController.addQuizController,
);
router.put(
  "/:id",
  JoiValidators.inputValidator(JoiValidators.updateQuizSchema),
  generalAuthFunction,
  rolePermit(["admin"]),
  quizController.updateQuizController,
);
router.delete(
  "/:id",
  generalAuthFunction,
  rolePermit(["admin"]),
  quizController.deleteQuizController,
);
router.get(
  "/:courseId",
  generalAuthFunction,
  ...(enforce ? [requirePremiumEntitlement] : []),
  quizController.getCourseQuizzesController,
);

export default router;
