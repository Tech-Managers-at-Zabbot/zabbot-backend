import express from "express";
import multer from "multer";
import path from "path";
import { randomUUID } from "crypto";
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
import { generalAuthFunction, rolePermit } from "../../../shared/middleware/authorization.middleware";
import fs from "fs/promises";
import { requirePronunciationEntitlement } from "../../../shared/subscription-gating/requirePronunciationEntitlement";

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
    const ext = path.extname(file.originalname).toLowerCase();
    const safeExt = [".wav", ".webm", ".mp3", ".ogg", ".m4a"].includes(ext) ? ext : ".audio";
    const uniqueName = `${Date.now()}-${randomUUID()}${safeExt}`;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024, files: 1 },
});
// Remove uploaded audio after denied/error responses. This also prevents
// unauthorised clients from leaving uploaded files behind on disk.
const cleanupDeniedUpload: express.RequestHandler = (req, res, next) => {
  res.once("finish", () => {
    if (res.statusCode >= 400 && req.file?.path) {
      void fs.unlink(req.file.path).catch(() => undefined);
    }
  });
  next();
};

// @ts-ignore
router.get("/", getRefPronunciationsController);
// @ts-ignore
router.get("/:id", getRefPronunciationController);
router.post(
  "/:id/feedback",
  // @ts-ignore
  generalAuthFunction,
  upload.single("file"),
  cleanupDeniedUpload,
  // The request body is multipart, therefore the DB-verified exception
  // check must occur after multer populates req.body. The flag remains OFF.
  ...(process.env.ZABBOT_SUBSCRIPTION_GATING_ENFORCE === "true"
    ? [requirePronunciationEntitlement]
    : []),
  comparePronunciation
);
// @ts-ignore
router.post("/reference", generalAuthFunction, rolePermit(["admin"]), addRefPronunciationController);
// @ts-ignore
router.get("/user/recordings", generalAuthFunction, getPronunciationsController);
// @ts-ignore
router.get("/user/:id", generalAuthFunction, getPronunciationController);

export default router;
