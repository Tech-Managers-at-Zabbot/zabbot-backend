import Languages from "src/entities/language";
import { errorUtilities } from "../../../shared/utilities";
import { LanguageAttributes } from "src/data-types/interface";
import { updateLanguage } from "src/controllers/language.controllers";

getLanguages: async (filter: {isActive: boolean}) => {
  try {
    const where: any = {}
    if (typeof filter?.isActive === 'boolean') {
      where.isActive = filter.isActive
    }

    // Pass it straight to Sequelize
    const languages = await Languages.findAll({ where });

    return languages;
  } catch (error: any) {
      throw errorUtilities.createError(`Error Fetching languages: ${error.message}`, 500);
  }
}

getLanguage: async (id: string) => {
  try {
    const language = await Languages.findByPk(id);

    return language;

  } catch (error: any) {

    throw errorUtilities.createError(`Error Fetching language: ${error.message}`, 500);
  }
}

addLanguage: async (languageData: LanguageAttributes) => {
  try {
    // Check if the language already exists
    const currentLanguage = await Languages.findOne({ where: { code: languageData.code } });
    if (currentLanguage) {
      throw errorUtilities.createError(`Language with code ${languageData.code} already exists`, 400);
    }

    // Create a new language
    const newLanguage = await Languages.create({
      code: languageData.code,
      title: languageData.title
    });

    return newLanguage;

  } catch (error: any) {

    throw errorUtilities.createError(`Error Adding language: ${error.message}`, 500);
  }
}

updateLanguage: async (id: string, languageData: LanguageAttributes) => {
  try {
    // Check if the language exists
    const currentLanguage = await Languages.findByPk(id);
    if (!currentLanguage) {
      throw errorUtilities.createError(`Language does not exist`, 404);
    }

    currentLanguage.title = languageData.title;
    currentLanguage.code = languageData.code;

    // Update the language
    const updatedLanguage = await Languages.update( currentLanguage, { where: { id } });

    return updatedLanguage;

  } catch (error: any) {

    throw errorUtilities.createError(`Error Updating language: ${error.message}`, 500);
  }
}

toggleLanguageStatus: async (id: string) => {
  const language = await Languages.findByPk(id);
  if (!language)
    throw errorUtilities.createError(`Language does not exist`, 404);

  language.isActive = !language.isActive;

  // Update the language
  const updatedLanguage = await Languages.update( language, { where: { id } });

  return updatedLanguage;  
}