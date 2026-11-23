import express from "express";
import {
  getContentsController,
  getLessonContentsController,
  getContentController,
  addContentController,
  updateContentController,
  getLanguageContentsController,
  addContentFileController,
  updateContentFileController,
  deleteContentFileController,
  deleteContentController,
} from "../controllers/content.controller";
import {
  generalAuthFunction,
  rolePermit,
} from "../../../shared/middleware/authorization.middleware";

import { requireLessonEntitlement } from "../../../shared/subscription-gating/requireLessonEntitlement";
import { requireContentEntitlement } from "../../../shared/subscription-gating/requireContentEntitlement";
import { requirePremiumEntitlement } from "../../../shared/subscription-gating/requirePremiumEntitlement";

// All premium-route changes are disabled until the release-wide audit passes.
const enforce = process.env.ZABBOT_SUBSCRIPTION_GATING_ENFORCE === "true";
const router = express.Router();

router.get("/", ...(enforce ? [generalAuthFunction, requirePremiumEntitlement] : []), getContentsController);
router.get(
  "/lesson/:lessonId",
  ...(enforce ? [generalAuthFunction, requireLessonEntitlement] : []),
  getLessonContentsController,
);
router.post(
  "/",
  generalAuthFunction,
  rolePermit(["admin"]),
  addContentController,
);
router.get(
  "/language-contents/:languageId",
  ...(enforce ? [generalAuthFunction, requirePremiumEntitlement] : []),
  getLanguageContentsController,
);
router.post(
  "/add-file",
  generalAuthFunction,
  rolePermit(["admin"]),
  addContentFileController,
);
router.put(
  "/file/:id",
  generalAuthFunction,
  rolePermit(["admin"]),
  updateContentFileController,
);
router.delete(
  "/file/:id",
  generalAuthFunction,
  rolePermit(["admin"]),
  deleteContentFileController,
);
router.get(
  "/:id",
  ...(enforce ? [generalAuthFunction, requireContentEntitlement] : []),
  getContentController,
);
router.put(
  "/:id",
  generalAuthFunction,
  rolePermit(["admin"]),
  updateContentController,
);
router.delete(
  "/:id",
  generalAuthFunction,
  rolePermit(["admin"]),
  deleteContentController,
);

export default router;
