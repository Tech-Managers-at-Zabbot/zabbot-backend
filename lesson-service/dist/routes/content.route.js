"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const content_controller_1 = require("../controllers/content.controller");
const router = express_1.default.Router();
router.get('/', content_controller_1.getContentsController);
router.get('/lesson/:lessonId', content_controller_1.getLessonContentsController);
router.get('/:id', content_controller_1.getContentController);
router.post('/', content_controller_1.addContentController);
router.put('/:id', content_controller_1.updateContentController);
exports.default = router;
