"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateContentController = exports.addContentController = exports.getContentController = exports.getLessonContentsController = exports.getContentsController = void 0;
const content_service_1 = __importDefault(require("../services/lessonServices/content.service"));
const utilities_1 = require("../../../shared/utilities");
// Controller to get all contents
exports.getContentsController = utilities_1.errorUtilities.withControllerErrorHandling(async (req, res) => {
    const payload = req.body;
    const contents = await content_service_1.default.getContents(payload);
    return utilities_1.responseUtilities.responseHandler(res, contents.message, contents.statusCode, contents.data);
});
// Controller to get contents for a specific lesson
exports.getLessonContentsController = utilities_1.errorUtilities.withControllerErrorHandling(async (req, res) => {
    const { lessonId } = req.params;
    const contents = await content_service_1.default.getLessonContents(lessonId);
    return utilities_1.responseUtilities.responseHandler(res, contents.message, contents.statusCode, contents.data);
});
// Controller to get a single content
exports.getContentController = utilities_1.errorUtilities.withControllerErrorHandling(async (req, res) => {
    const { id } = req.params;
    const content = await content_service_1.default.getContent(req);
    return utilities_1.responseUtilities.responseHandler(res, content.message, content.statusCode, content.data);
});
// Controller to create a new content
exports.addContentController = utilities_1.errorUtilities.withControllerErrorHandling(async (req, res) => {
    const payload = req.body;
    const content = await content_service_1.default.addContent(payload);
    return utilities_1.responseUtilities.responseHandler(res, content.message, content.statusCode, content.data);
});
// Controller to update an existing content
exports.updateContentController = utilities_1.errorUtilities.withControllerErrorHandling(async (req, res) => {
    const { id } = req.params;
    const payload = req.body;
    const content = await content_service_1.default.updateContent(id, payload);
    return utilities_1.responseUtilities.responseHandler(res, content.message, content.statusCode, content.data);
});
