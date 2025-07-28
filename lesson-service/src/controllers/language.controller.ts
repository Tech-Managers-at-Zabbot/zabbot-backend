import {Request, Response} from 'express';
import { errorUtilities, responseUtilities } from '../../../shared/utilities';
import languageService from '../services/languageServices/language.service';
import languageContentService from '../services/languageServices/language-content.service';

// Controller to get all languages
export const getLanguagesController = errorUtilities.withControllerErrorHandling(
  async (req: Request, res: Response) => {
    const payload = req.body;
    const languages = await languageService.getLanguages(payload);

    return responseUtilities.responseHandler(res, languages.message, languages.statusCode, languages.data);
  }
);

// Controller to get a single language
export const getLanguageController = errorUtilities.withControllerErrorHandling(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const language = await languageService.getLanguage(id);

    return responseUtilities.responseHandler(res, language.message, language.statusCode, language.data);
  }
);

// Controller to add a new language
export const createLanguageController = errorUtilities.withControllerErrorHandling(
  async (req: Request, res: Response) => {
    const payload = req.body;
    const language = await languageService.addLanguage(payload);

    return responseUtilities.responseHandler(res, language.message, language.statusCode, language.data);
  }
);

// Controller to update an existing language
export const updateLanguageController = errorUtilities.withControllerErrorHandling(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const payload = req.body;
    const language = await languageService.updateLanguage(id, payload);

    return responseUtilities.responseHandler(res, language.message, language.statusCode, language.data);
  }
);

// Controller to change the status of a language
export const changeLanguageStatusController = errorUtilities.withControllerErrorHandling(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const updatedLanguage = await languageService.changeLanguageStatus(id);

    return responseUtilities.responseHandler(res, updatedLanguage.message, updatedLanguage.statusCode, updatedLanguage.data);
  }
);

// Controller to delete a language
export const deleteLanguageController = errorUtilities.withControllerErrorHandling(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const deletedLanguage = await languageService.deleteLanguage(id);

    return responseUtilities.responseHandler(res, deletedLanguage.message, deletedLanguage.statusCode, deletedLanguage.data);
  }
);

export const getLanguageContentsController = errorUtilities.withControllerErrorHandling (
  async (req: Request, res: Response) => {
    const {languageId} = req.query;
    const languageContents = await languageContentService.getLanguageContents({languageId});

    return responseUtilities.responseHandler(res, languageContents.message, languageContents.statusCode, languageContents.data);
  }
);

export const getLanguageContentController = errorUtilities.withControllerErrorHandling (
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const languageContent = await languageContentService.getLanguageContent(id);

    return responseUtilities.responseHandler(res, languageContent.message, languageContent.statusCode, languageContent.data);
  }
);

export const addLanguageContentController = errorUtilities.withControllerErrorHandling(
  async (req: Request, res: Response) => {
    const payload = req.body;
    const newLanguageContent = await languageContentService.addLanguageContent(payload);

    return responseUtilities.responseHandler(res, newLanguageContent.message, newLanguageContent.statusCode, newLanguageContent.data);
  }
);

export const updateLanguageContentController = errorUtilities.withControllerErrorHandling(
  async (req: Request, res: Response) => {
    const id = req.params;
    const payload = req.body;
    const updateLanguageContent = await languageContentService.updateLanguageContent(id, payload);

    return responseUtilities.responseHandler(res, updateLanguageContent.message, updateLanguageContent.statusCode, updateLanguageContent.data);
  }
);

export const deleteLanguageContentController = errorUtilities.withControllerErrorHandling(
  async (req: Request, res: Response) => {
    const id = req.params;
    const deleteData = await languageContentService.deleteLanguageContent(id);

    return responseUtilities.responseHandler(res, deleteData.message, deleteData.statusCode, deleteData.data);
  }
)