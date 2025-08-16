"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deletePronunciation = exports.updatePronunciation = exports.addPronunciationController = exports.getPronunciationController = exports.getPronunciationsController = void 0;
const user_pronunciation_service_1 = __importDefault(require("../services/user-pronunciation.service"));
const utilities_1 = require("../../../shared/utilities");
exports.getPronunciationsController = utilities_1.errorUtilities.withControllerErrorHandling(async (req, res) => {
    const pronunciation = await user_pronunciation_service_1.default.getPronunciations();
    return utilities_1.responseUtilities.responseHandler(res, pronunciation.message, pronunciation.statusCode, pronunciation.data);
});
exports.getPronunciationController = utilities_1.errorUtilities.withControllerErrorHandling(async (req, res) => {
    const { id } = req.params;
    const pronunciation = await user_pronunciation_service_1.default.getPronunciation(id);
    return utilities_1.responseUtilities.responseHandler(res, pronunciation.message, pronunciation.statusCode, pronunciation.data);
});
exports.addPronunciationController = utilities_1.errorUtilities.withControllerErrorHandling(async (req, res) => {
    const payload = req.body;
    const pronunciation = await user_pronunciation_service_1.default.addPronunciation(payload);
    return utilities_1.responseUtilities.responseHandler(res, pronunciation.message, pronunciation.statusCode, pronunciation.data);
});
exports.updatePronunciation = utilities_1.errorUtilities.withControllerErrorHandling(async (req, res) => {
    const { id } = req.params;
    const payload = req.body;
    const content = await user_pronunciation_service_1.default.updatePronunciation(id, payload);
    return utilities_1.responseUtilities.responseHandler(res, content.message, content.statusCode, content.data);
});
exports.deletePronunciation = utilities_1.errorUtilities.withControllerErrorHandling(async (req, res) => {
    const { id } = req.params;
    const content = await user_pronunciation_service_1.default.deletePronunciation(id);
    return utilities_1.responseUtilities.responseHandler(res, content.message, content.statusCode, content.data);
});
