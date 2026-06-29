import express from "express";
import { generalAuthFunction } from "../../../shared/middleware/authorization.middleware";
import {
  addUserLessonController,
  getUserLessonController,
  getUserLessonsController,
  updateUserLessonController,
} from "../controllers/userLesson.controller";

const router = express.Router();

router.get("/", generalAuthFunction, getUserLessonsController);
router.get("/:lessonId", generalAuthFunction, getUserLessonController);
router.post("/", generalAuthFunction, addUserLessonController);
router.put("/:lessonId", generalAuthFunction, updateUserLessonController);
router.patch("/:lessonId", generalAuthFunction, updateUserLessonController);

export default router;
