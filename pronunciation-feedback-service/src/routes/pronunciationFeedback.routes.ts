import express from "express";
import multer from "multer";
import path from "path";
import {
  addRefPronunciationController,
  comparePronunciation,
  getRefPronunciationController,
  getRefPronunciationsController,
} from "../controllers/referencePronunciation.controller";
import { getPronunciationController } from "../controllers/userPronunciation.controller";
import { generalAuthFunction } from "../../../shared/middleware/authorization.middleware";

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../utilities/audioFiles/uploads/raw"));
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "-" + file.originalname;
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

// @ts-ignore
router.get("/", getRefPronunciationsController);
// @ts-ignore
router.get("/:id", getRefPronunciationController);
router.post(
  "/:id/feedback",
  // @ts-ignore
  generalAuthFunction,
  upload.single("file"),
  comparePronunciation
);
// @ts-ignore
router.post("/reference", addRefPronunciationController);
// @ts-ignore
router.get("/user/:id", getPronunciationController);

export default router;
