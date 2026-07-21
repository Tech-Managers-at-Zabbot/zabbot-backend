import express from "express";
import { quizController } from "../controllers";
import {
  generalAuthFunction,
  rolePermit,
} from "../../../shared/middleware/authorization.middleware";
import { JoiValidators } from "../validations";

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
  quizController.getCourseQuizzesController,
);

export default router;
