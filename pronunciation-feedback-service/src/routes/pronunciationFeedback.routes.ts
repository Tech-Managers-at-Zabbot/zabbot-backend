import express from "express";
import multer from "multer";
import path from "path";
import {
  addRefPronunciationController,
  comparePronunciation,
  getRefPronunciationController,
  getRefPronunciationsController,
} from "../controllers/referencePronunciation.controller";
import {
  getPronunciationController,
  getPronunciationsController,
} from "../controllers/userPronunciation.controller";
import { generalAuthFunction } from "../../../shared/middleware/authorization.middleware";
import fs from "fs/promises";

const router = express.Router();

(async () => {
  const userRawFilePath = path.join(
    __dirname,
    "../utilities/audioFiles/uploads/raw"
  );
  await fs.mkdir(userRawFilePath, { recursive: true });
  console.log("file createds");
})();

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
router.get("/user/recordings", getPronunciationsController);
// @ts-ignore
router.get("/user/:id", getPronunciationController);

export default router;
