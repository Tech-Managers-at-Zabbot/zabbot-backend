"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const lesson_controller_1 = require("../controllers/lesson.controller");
const authorization_middleware_1 = require("../../../shared/middleware/authorization.middleware");
const router = express_1.default.Router();
router.get('/', lesson_controller_1.getLessonsController);
router.get('/:id', lesson_controller_1.getLessonController);
router.post('/', authorization_middleware_1.generalAuthFunction, (0, authorization_middleware_1.rolePermit)(["admin"]), lesson_controller_1.createLessonController);
router.put('/:id', authorization_middleware_1.generalAuthFunction, (0, authorization_middleware_1.rolePermit)(["admin"]), lesson_controller_1.updateLessonController);
router.get('/lesson-with-contents/:lessonId', authorization_middleware_1.generalAuthFunction, lesson_controller_1.getLessonWithContentsController);
router.get('/language-lessons/:languageId', authorization_middleware_1.generalAuthFunction, lesson_controller_1.getLanguageLessonsController);
exports.default = router;
