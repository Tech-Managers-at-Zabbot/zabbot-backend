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

const router = express.Router();

router.get("/", getContentsController);
router.get("/lesson/:lessonId", getLessonContentsController);
router.post(
  "/",
  generalAuthFunction,
  rolePermit(["admin"]),
  addContentController,
);
router.get("/language-contents/:languageId", getLanguageContentsController);
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
router.get("/:id", getContentController);
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
