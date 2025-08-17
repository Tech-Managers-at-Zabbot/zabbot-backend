import { LanguageAttributes, LessonAttributes } from "../../data-types/interface"
import { errorUtilities, responseUtilities } from "../../../../shared/utilities";
import languageRepositories from "../../repositories/language.repository";
import { StatusCodes } from "../../../../shared/statusCodes/statusCodes.responses";
import { v4 } from "uuid";

const getLanguages = errorUtilities.withServiceErrorHandling(
  async (params?: {isActive: boolean}) => {
    const languages = await languageRepositories.getLanguages(params);
    return responseUtilities.handleServicesResponse(StatusCodes.OK, "success", languages);
  }
);

const getLanguage = errorUtilities.withServiceErrorHandling(
  async (id: string) => {
    const language = await languageRepositories.getLanguage(id);
    if (!language) {
      throw errorUtilities.createError(`Language not found`, 404);
    }

    return responseUtilities.handleServicesResponse(StatusCodes.OK, "success", language);
  }
);

const addLanguage = errorUtilities.withServiceErrorHandling(
  async (languageData: LanguageAttributes) => {

    // Check if the language already exists
    const currentLanguage = await languageRepositories.getLanguageByCode( languageData.code);
    if (currentLanguage) {
      throw errorUtilities.createError(`Language with code ${languageData.code} already exists`, 400);
    }

    languageData.title = languageData.title.charAt(0).toUpperCase() + languageData.title.slice(1)
    const newLanguagePayload = {
      ...languageData,
      id: v4(),
      createdAt: new Date(),
    }

    const newLanguage = await languageRepositories.addLanguage(newLanguagePayload);
    return responseUtilities.handleServicesResponse(StatusCodes.Created, "Language created successfully", newLanguage);
  }
);

const updateLanguage = errorUtilities.withServiceErrorHandling(
  async (id: string, languageData: LanguageAttributes) => {
    const language = await languageRepositories.getLanguage(id);
    if (!language) {
      throw errorUtilities.createError(`Language not found`, 404);
    }

    language.title = languageData.title;
    language.code = languageData.code;

    const updatedLanguage = await languageRepositories.updateLanguage(language);
    return responseUtilities.handleServicesResponse(StatusCodes.OK, "Language updated successfully", updatedLanguage);
  }
);

const changeLanguageStatus = errorUtilities.withServiceErrorHandling(
  async (id: string) => {
    const updatedLanguage = await languageRepositories.toggleLanguageStatus(id);

    return responseUtilities.handleServicesResponse(StatusCodes.NoContent, "Language status updated successfully", updatedLanguage);
  }
);

//Logic to check if the language can be deleted has not been implemented yet.
// For now, it will just delete the language if it exists.
// This logic should also check if the language is associated with any userLessons before deletion.
const deleteLanguage = errorUtilities.withServiceErrorHandling(
  async (id: string) => {
    const language = await languageRepositories.getLanguage(id);
    if (!language) {
      throw errorUtilities.createError(`Language not found`, 404);
    }

    await languageRepositories.deleteLanguage(id);
    return responseUtilities.handleServicesResponse(StatusCodes.NoContent, "Language deleted successfully", null);
  }
);

export default {
  getLanguages,
  getLanguage,
  addLanguage,
  updateLanguage,
  changeLanguageStatus,
  deleteLanguage
}