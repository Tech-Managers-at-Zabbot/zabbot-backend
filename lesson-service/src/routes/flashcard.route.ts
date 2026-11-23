import express from "express";
import { flashcardController } from "../controllers";
import {
  generalAuthFunction,
  rolePermit,
} from "../../../shared/middleware/authorization.middleware";
import { JoiValidators } from "../validations";

import { requirePremiumEntitlement } from "../../../shared/subscription-gating/requirePremiumEntitlement";
import { requireFlashcardPremiumOrPreview } from "../../../shared/subscription-gating/flashcardPreview";
const enforce = process.env.ZABBOT_SUBSCRIPTION_GATING_ENFORCE === "true";
const usePreviewGuard = process.env.ZABBOT_FLASHCARDS_FREE_PREVIEW_ENABLED === "true";
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
  ...(enforce ? [usePreviewGuard ? requireFlashcardPremiumOrPreview : requirePremiumEntitlement] : []),
  flashcardController.getFlashcardsController,
);

router.get(
  "/:id",
  generalAuthFunction,
  ...(enforce ? [usePreviewGuard ? requireFlashcardPremiumOrPreview : requirePremiumEntitlement] : []),
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
