"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.comparePronunciation = exports.deletePronunciation = exports.updateRefPronunciationController = exports.addRefPronunciationController = exports.getRefPronunciationController = exports.getRefPronunciationsController = void 0;
const reference_pronunciation_service_1 = __importDefault(require("../services/reference-pronunciation.service"));
const pronunciation_feedback_service_1 = __importDefault(require("../services/pronunciation-feedback.service"));
const utilities_1 = require("../../../shared/utilities");
exports.getRefPronunciationsController = utilities_1.errorUtilities.withControllerErrorHandling(async (req, res) => {
    const pronunciation = await reference_pronunciation_service_1.default.getPronunciations();
    return utilities_1.responseUtilities.responseHandler(
    // @ts-ignore
    res, pronunciation.message, pronunciation.statusCode, pronunciation.data);
});
exports.getRefPronunciationController = utilities_1.errorUtilities.withControllerErrorHandling(async (req, res) => {
    const { id } = req.params;
    const pronunciation = await reference_pronunciation_service_1.default.getPronunciation(id);
    return utilities_1.responseUtilities.responseHandler(res, pronunciation.message, pronunciation.statusCode, pronunciation.data);
});
exports.addRefPronunciationController = utilities_1.errorUtilities.withControllerErrorHandling(async (req, res) => {
    const payload = req.body;
    const pronunciation = await reference_pronunciation_service_1.default.addPronunciation(payload);
    return utilities_1.responseUtilities.responseHandler(res, pronunciation.message, pronunciation.statusCode, pronunciation.data);
});
exports.updateRefPronunciationController = utilities_1.errorUtilities.withControllerErrorHandling(async (req, res) => {
    const { id } = req.params;
    const payload = req.body;
    const content = await reference_pronunciation_service_1.default.updatePronunciation(id, payload);
    return utilities_1.responseUtilities.responseHandler(res, content.message, content.statusCode, content.data);
});
exports.deletePronunciation = utilities_1.errorUtilities.withControllerErrorHandling(async (req, res) => {
    const { id } = req.params;
    const content = await reference_pronunciation_service_1.default.deletePronunciation(id);
    return utilities_1.responseUtilities.responseHandler(res, content.message, content.statusCode, content.data);
});
exports.comparePronunciation = utilities_1.errorUtilities.withControllerErrorHandling(async (req, res) => {
    if (!req.file) {
        return utilities_1.responseUtilities.responseHandler(
        // @ts-ignore
        res, "File is required", 400, null);
    }
    const user = req.user;
    if (!user || !user.userId) {
        return utilities_1.responseUtilities.responseHandler(
        // @ts-ignore
        res, "User not authenticated", 400, null);
    }
    const referencePronunciationId = req.params.id;
    const { voice } = req.body;
    const pronunciation = await pronunciation_feedback_service_1.default.comparePronounciation({
        file: req.file,
        userId: user.userId,
        referencePronunciationId,
        voice,
    });
    return utilities_1.responseUtilities.responseHandler(
    // @ts-ignore
    res, pronunciation.message, pronunciation.statusCode, pronunciation.data);
});
