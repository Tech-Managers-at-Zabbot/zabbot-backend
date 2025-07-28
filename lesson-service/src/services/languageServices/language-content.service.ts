import { errorUtilities, responseUtilities } from "../../../../shared/utilities";
import languageRepositories from "../../repositories/language.repository";
import { StatusCodes } from "../../../../shared/statusCodes/statusCodes.responses";

const getLanguageContents = errorUtilities.withServiceErrorHandling (
  async (params?: { languageId: string }) => {
    const languageContents = await languageRepositories.getLanguageContents(params);
    return responseUtilities.handleServicesResponse(StatusCodes.OK, "success", languageContents);
  }
);

const getLanguageContent = errorUtilities.withServiceErrorHandling (
  async (id: string) => {
    const languageContent = await languageRepositories.getLanguageContent(id);
    if (!languageContent)
      throw errorUtilities.createError(`Language content not found`, 404);

    return responseUtilities.handleServicesResponse(StatusCodes.OK, "success", languageContent);
  }
);

const addLanguageContent = errorUtilities.withServiceErrorHandling (
  async (payload) => {
    const newLanguageContent = await languageRepositories.addLanguageContent(payload);
    return responseUtilities.handleServicesResponse(StatusCodes.OK, "success", newLanguageContent);
  }
);

const updateLanguageContent = errorUtilities.withServiceErrorHandling (
  async (id: string, payload: any) => {
    const languageContent = await languageRepositories.getLanguageContent(id);
    if (!languageContent)
      throw errorUtilities.createError(`Language content not found`, 404);

    const updateLanguageContent = await languageRepositories.updateLanguageContent(id, payload);
    return responseUtilities.handleServicesResponse(StatusCodes.OK, "success", updateLanguageContent);
  }
);

const deleteLanguageContent = errorUtilities.withServiceErrorHandling (
  async (id: string) => {
    const languageContent = await languageRepositories.getLanguageContent(id);
    if (!languageContent)
      throw errorUtilities.createError('Language content not found', 404);

    await languageRepositories.deleteLanguageContent(id);
    return responseUtilities.handleServicesResponse(StatusCodes.OK, "success");
  }
);

export default {
  getLanguageContents,
  getLanguageContent,
  addLanguageContent,
  updateLanguageContent,
  deleteLanguageContent
}