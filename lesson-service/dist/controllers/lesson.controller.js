"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLessonWithContentsController = exports.updateLessonController = exports.createLessonController = exports.getLanguageLessonsController = exports.getLessonController = exports.getLessonsController = void 0;
const lesson_service_1 = __importDefault(require("../services/lessonServices/lesson.service"));
const utilities_1 = require("../../../shared/utilities");
// Controller to get all lessons
exports.getLessonsController = utilities_1.errorUtilities.withControllerErrorHandling(async (req, res) => {
    const payload = req.body;
    const lessons = await lesson_service_1.default.getLessons(payload);
    return utilities_1.responseUtilities.responseHandler(res, lessons.message, lessons.statusCode, lessons.data);
});
// Controller to get a single lesson
exports.getLessonController = utilities_1.errorUtilities.withControllerErrorHandling(async (req, res) => {
    const { id } = req.params;
    const lesson = await lesson_service_1.default.getLesson(id);
    return utilities_1.responseUtilities.responseHandler(res, lesson.message, lesson.statusCode, lesson.data);
});
exports.getLanguageLessonsController = utilities_1.errorUtilities.withControllerErrorHandling(async (req, res) => {
    const { languageId } = req.params;
    const lesson = await lesson_service_1.default.getLessonsForLanguage(languageId);
    return utilities_1.responseUtilities.responseHandler(res, lesson.message, lesson.statusCode, lesson.data);
});
// Controller to create a new lesson
exports.createLessonController = utilities_1.errorUtilities.withControllerErrorHandling(async (req, res) => {
    const payload = req.body;
    const lesson = await lesson_service_1.default.createLesson(payload);
    return utilities_1.responseUtilities.responseHandler(res, lesson.message, lesson.statusCode, lesson.data);
});
// Controller to update an existing lesson
exports.updateLessonController = utilities_1.errorUtilities.withControllerErrorHandling(async (req, res) => {
    const { id } = req.params;
    const payload = req.body;
    const lesson = await lesson_service_1.default.updateLesson(id, payload);
    return utilities_1.responseUtilities.responseHandler(res, lesson.message, lesson.statusCode, lesson.data);
});
exports.getLessonWithContentsController = utilities_1.errorUtilities.withControllerErrorHandling(async (req, res) => {
    const { lessonId } = req.params;
    const lesson = await lesson_service_1.default.getLessonWithContents(lessonId);
    return utilities_1.responseUtilities.responseHandler(res, lesson.message, lesson.statusCode, lesson.data);
});
