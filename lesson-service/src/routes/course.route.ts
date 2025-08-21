import express from "express";
import {
  generalAuthFunction,
  rolePermit,
} from "../../../shared/middleware/authorization.middleware";

import {
  getCoursesController,
  getCourseController,
  getCourseByTitleController,
  addCourseController,
  updateCourseController,
  getUserCoursesController,
  getUserCourseController,
  addUserCourseController,
  updateUserCourseController,
  removeUserCourseController,
  createCourseWithLessonsController,
  getCourseWithLessonsController,
  getUserCompletedCoursesController,
} from "../controllers/course.controller";

const router = express.Router();

router.get("/:languageId", getCoursesController);
router.get("/single-course/:courseId", getCourseController);
router.get("/title/:title", getCourseByTitleController);
router.post(
  "/",
  generalAuthFunction,
  rolePermit(["admin"]),
  addCourseController
);
router.put(
  "/:id",
  generalAuthFunction,
  rolePermit(["admin"]),
  updateCourseController
);

router.get("/users", generalAuthFunction, getUserCoursesController);
router.get(
  "/user-course/:languageId/:courseId",
  generalAuthFunction,
  getUserCourseController
);
router.post(
  "/add-user-course/:languageId/:courseId",
  generalAuthFunction,
  addUserCourseController
);
router.put(
  "/update-user-course/:courseId",
  generalAuthFunction,
  updateUserCourseController
);
router.delete("/users/:id", generalAuthFunction, removeUserCourseController);
router.get(
  "/user-completed-courses/:languageId",
  generalAuthFunction,
  getUserCompletedCoursesController
);
router.post(
  "/course-with-lesson/:languageId",
  createCourseWithLessonsController
);
router.get(
  "/get-course-with-lesson/:languageId",
  generalAuthFunction,
  getCourseWithLessonsController
);
//generalAuthFunction, rolePermit(["admin"]),
export default router;
