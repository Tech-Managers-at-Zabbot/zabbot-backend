"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const referencePronunciation_controller_1 = require("../controllers/referencePronunciation.controller");
const userPronunciation_controller_1 = require("../controllers/userPronunciation.controller");
const authorization_middleware_1 = require("../../../shared/middleware/authorization.middleware");
const promises_1 = __importDefault(require("fs/promises"));
const router = express_1.default.Router();
(async () => {
    const userRawFilePath = path_1.default.join(__dirname, "../utilities/audioFiles/uploads/raw");
    await promises_1.default.mkdir(userRawFilePath, { recursive: true });
    console.log("file createds");
})();
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path_1.default.join(__dirname, "../utilities/audioFiles/uploads/raw"));
    },
    filename: (req, file, cb) => {
        const uniqueName = Date.now() + "-" + file.originalname;
        cb(null, uniqueName);
    },
});
const upload = (0, multer_1.default)({ storage });
// @ts-ignore
router.get("/", referencePronunciation_controller_1.getRefPronunciationsController);
// @ts-ignore
router.get("/:id", referencePronunciation_controller_1.getRefPronunciationController);
router.post("/:id/feedback", 
// @ts-ignore
authorization_middleware_1.generalAuthFunction, upload.single("file"), referencePronunciation_controller_1.comparePronunciation);
// @ts-ignore
router.post("/reference", referencePronunciation_controller_1.addRefPronunciationController);
// @ts-ignore
router.get("/user/recordings", userPronunciation_controller_1.getPronunciationsController);
// @ts-ignore
router.get("/user/:id", userPronunciation_controller_1.getPronunciationController);
exports.default = router;
