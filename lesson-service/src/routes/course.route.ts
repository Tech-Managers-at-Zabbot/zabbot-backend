import express from "express";
import {
  generalAuthFunction,
  rolePermit,
} from "../../../shared/middleware/authorization.middleware";
import multer from "multer";

import {
  getCoursesController,
  getCourseController,
  getCourseByTitleController,
  addCourseController,
  updateCourseController,
  deleteCourseController,
  getUserCoursesController,
  getUserCourseController,
  addUserCourseController,
  updateUserCourseController,
  removeUserCourseController,
  createCourseWithLessonsController,
  getCourseWithLessonsController,
  getUserCompletedCoursesController,
  updateCourseImageController,
} from "../controllers/course.controller";

const upload = multer({ storage: multer.memoryStorage() });
const router = express.Router();

router.get("/:languageId", getCoursesController);
router.get("/single-course/:courseId", getCourseController);
router.get("/title/:title", getCourseByTitleController);
router.post(
  "/",
  generalAuthFunction,
  rolePermit(["admin"]),
  addCourseController,
);
router.put(
  "/:id",
  generalAuthFunction,
  rolePermit(["admin"]),
  updateCourseController,
);
router.delete(
  "/:id",
  generalAuthFunction,
  rolePermit(["admin"]),
  deleteCourseController,
);

router.get("/users", generalAuthFunction, getUserCoursesController);
router.get(
  "/user-course/:languageId/:courseId",
  generalAuthFunction,
  getUserCourseController,
);
router.post(
  "/add-user-course/:languageId/:courseId",
  generalAuthFunction,
  addUserCourseController,
);
router.put(
  "/update-user-course/:courseId",
  generalAuthFunction,
  updateUserCourseController,
);
router.delete("/users/:id", generalAuthFunction, removeUserCourseController);
router.get(
  "/user-completed-courses/:languageId",
  generalAuthFunction,
  getUserCompletedCoursesController,
);
router.post(
  "/course-with-lesson/:languageId",
  createCourseWithLessonsController,
);
router.get(
  "/get-course-with-lesson/:languageId",
  generalAuthFunction,
  getCourseWithLessonsController,
);

router.put(
  "/change-course-image/:courseId",
  upload.array("files", 50),
  generalAuthFunction,
  rolePermit(["admin"]),
  updateCourseImageController,
);

export default router;
