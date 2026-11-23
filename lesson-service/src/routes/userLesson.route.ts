import express from "express";
import { generalAuthFunction } from "../../../shared/middleware/authorization.middleware";
import {
  addUserLessonController,
  deleteUserLessonController,
  getUserLessonController,
  getUserLessonsController,
  updateUserLessonController,
} from "../controllers/userLesson.controller";

import { requireLessonEntitlement } from "../../../shared/subscription-gating/requireLessonEntitlement";
import { requireLessonEntitlementFromBody } from "../../../shared/subscription-gating/requireLessonEntitlementFromBody";
const enforce = process.env.ZABBOT_SUBSCRIPTION_GATING_ENFORCE === "true";
const router = express.Router();

router.get("/", generalAuthFunction, getUserLessonsController);
router.get("/:lessonId", generalAuthFunction, getUserLessonController);
router.post(
  "/",
  generalAuthFunction,
  ...(enforce ? [requireLessonEntitlementFromBody] : []),
  addUserLessonController,
);
router.put(
  "/:lessonId",
  generalAuthFunction,
  ...(enforce ? [requireLessonEntitlement] : []),
  updateUserLessonController,
);
router.patch(
  "/:lessonId",
  generalAuthFunction,
  ...(enforce ? [requireLessonEntitlement] : []),
  updateUserLessonController,
);
router.delete("/:lessonId", generalAuthFunction, deleteUserLessonController);

export default router;
