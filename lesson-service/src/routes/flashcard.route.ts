import express from "express";
import { flashcardController } from "../controllers";
import {
  generalAuthFunction,
  rolePermit,
} from "../../../shared/middleware/authorization.middleware";
import { JoiValidators } from "../validations";

const router = express.Router();

router.post(
  "/",
  JoiValidators.inputValidator(JoiValidators.createFlashcardSchema),
  generalAuthFunction,
  rolePermit(["admin"]),
  flashcardController.addFlashcardController,
);

router.get(
  "/",
  generalAuthFunction,
  flashcardController.getFlashcardsController,
);

router.get(
  "/:id",
  generalAuthFunction,
  flashcardController.getFlashcardController,
);

router.put(
  "/:id",
  JoiValidators.inputValidator(JoiValidators.updateFlashcardSchema),
  generalAuthFunction,
  rolePermit(["admin"]),
  flashcardController.updateFlashcardController,
);

router.delete(
  "/:id",
  generalAuthFunction,
  rolePermit(["admin"]),
  flashcardController.deleteFlashcardController,
);

export default router;
