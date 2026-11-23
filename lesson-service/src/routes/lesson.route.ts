import express from "express";
import {
  getLessonsController,
  getLessonController,
  createLessonController,
  updateLessonController,
  changeLessonStatusController,
  deleteLessonController,
  getLessonWithContentsController,
  getLanguageLessonsController,
  getCourseLessonsController,
  updateLessonImageController,
} from "../controllers/lesson.controller";
import {
  generalAuthFunction,
  rolePermit,
} from "../../../shared/middleware/authorization.middleware";
import multer from "multer";
import { requireLessonEntitlement } from "../../../shared/subscription-gating/requireLessonEntitlement";

const upload = multer({ storage: multer.memoryStorage() });

const router = express.Router();

router.get("/", getLessonsController);
router.get("/:id", getLessonController);
router.post(
  "/",
  generalAuthFunction,
  rolePermit(["admin"]),
  createLessonController,
);
router.put(
  "/:id",
  generalAuthFunction,
  rolePermit(["admin"]),
  updateLessonController,
);
router.patch(
  "/:id/status",
  generalAuthFunction,
  rolePermit(["admin"]),
  changeLessonStatusController,
);
router.delete(
  "/:id",
  generalAuthFunction,
  rolePermit(["admin"]),
  deleteLessonController,
);
// The backend enforcement flag defaults OFF until every alternate lesson,
// content, quiz, and AI endpoint is independently protected and tested.
// Never enable this flag in production based on this route alone.
router.get(
  "/lesson-with-contents/:lessonId",
  generalAuthFunction,
  ...(process.env.ZABBOT_SUBSCRIPTION_GATING_ENFORCE === "true"
    ? [requireLessonEntitlement]
    : []),
  getLessonWithContentsController,
);
router.get(
  "/language-lessons/:languageId",
  generalAuthFunction,
  getLanguageLessonsController,
);
router.get(
  "/course-lessons/:courseId",
  generalAuthFunction,
  getCourseLessonsController,
);
router.put(
  "/change-lesson-image/:lessonId",
  upload.array("files", 50),
  generalAuthFunction,
  rolePermit(["admin"]),
  updateLessonImageController,
);

export default router;
