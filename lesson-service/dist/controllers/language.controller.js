"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteLanguageController = exports.changeLanguageStatusController = exports.updateLanguageController = exports.createLanguageController = exports.getLanguageController = exports.getLanguagesController = void 0;
const utilities_1 = require("../../../shared/utilities");
const language_service_1 = __importDefault(require("../services/languageServices/language.service"));
// import languageContentService from '../services/languageServices/language-content.service';
// Controller to get all languages
exports.getLanguagesController = utilities_1.errorUtilities.withControllerErrorHandling(async (req, res) => {
    const payload = req.body;
    const languages = await language_service_1.default.getLanguages(payload);
    return utilities_1.responseUtilities.responseHandler(res, languages.message, languages.statusCode, languages.data);
});
// Controller to get a single language
exports.getLanguageController = utilities_1.errorUtilities.withControllerErrorHandling(async (req, res) => {
    const { id } = req.params;
    const language = await language_service_1.default.getLanguage(id);
    return utilities_1.responseUtilities.responseHandler(res, language.message, language.statusCode, language.data);
});
// Controller to add a new language
exports.createLanguageController = utilities_1.errorUtilities.withControllerErrorHandling(async (req, res) => {
    const payload = req.body;
    const language = await language_service_1.default.addLanguage(payload);
    return utilities_1.responseUtilities.responseHandler(res, language.message, language.statusCode, language.data);
});
// Controller to update an existing language
exports.updateLanguageController = utilities_1.errorUtilities.withControllerErrorHandling(async (req, res) => {
    const { id } = req.params;
    const payload = req.body;
    const language = await language_service_1.default.updateLanguage(id, payload);
    return utilities_1.responseUtilities.responseHandler(res, language.message, language.statusCode, language.data);
});
// Controller to change the status of a language
exports.changeLanguageStatusController = utilities_1.errorUtilities.withControllerErrorHandling(async (req, res) => {
    const { id } = req.params;
    const updatedLanguage = await language_service_1.default.changeLanguageStatus(id);
    return utilities_1.responseUtilities.responseHandler(res, updatedLanguage.message, updatedLanguage.statusCode, updatedLanguage.data);
});
// Controller to delete a language
exports.deleteLanguageController = utilities_1.errorUtilities.withControllerErrorHandling(async (req, res) => {
    const { id } = req.params;
    const deletedLanguage = await language_service_1.default.deleteLanguage(id);
    return utilities_1.responseUtilities.responseHandler(res, deletedLanguage.message, deletedLanguage.statusCode, deletedLanguage.data);
});
// export const getLanguageContentsController = errorUtilities.withControllerErrorHandling (
//   async (req: Request, res: Response) => {
//     const {languageId} = req.query;
//     const languageContents = await languageContentService.getLanguageContents({languageId});
//     return responseUtilities.responseHandler(res, languageContents.message, languageContents.statusCode, languageContents.data);
//   }
// );
// export const getLanguageContentController = errorUtilities.withControllerErrorHandling (
//   async (req: Request, res: Response) => {
//     const { id } = req.params;
//     const languageContent = await languageContentService.getLanguageContent(id);
//     return responseUtilities.responseHandler(res, languageContent.message, languageContent.statusCode, languageContent.data);
//   }
// );
// export const addLanguageContentController = errorUtilities.withControllerErrorHandling(
//   async (req: Request, res: Response) => {
//     const payload = req.body;
//     const newLanguageContent = await languageContentService.addLanguageContent(payload);
//     return responseUtilities.responseHandler(res, newLanguageContent.message, newLanguageContent.statusCode, newLanguageContent.data);
//   }
// );
// export const updateLanguageContentController = errorUtilities.withControllerErrorHandling(
//   async (req: Request, res: Response) => {
//     const id = req.params;
//     const payload = req.body;
//     const updateLanguageContent = await languageContentService.updateLanguageContent(id, payload);
//     return responseUtilities.responseHandler(res, updateLanguageContent.message, updateLanguageContent.statusCode, updateLanguageContent.data);
//   }
// );
// export const deleteLanguageContentController = errorUtilities.withControllerErrorHandling(
//   async (req: Request, res: Response) => {
//     const id = req.params;
//     const deleteData = await languageContentService.deleteLanguageContent(id);
//     return responseUtilities.responseHandler(res, deleteData.message, deleteData.statusCode, deleteData.data);
//   }
// )
