"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const lesson_controller_1 = require("../controllers/lesson.controller");
const router = express_1.default.Router();
router.get('/', lesson_controller_1.getLessonsController);
router.get('/:id', lesson_controller_1.getLessonController);
router.post('/', lesson_controller_1.createLessonController);
router.put('/:id', lesson_controller_1.updateLessonController);
exports.default = router;
