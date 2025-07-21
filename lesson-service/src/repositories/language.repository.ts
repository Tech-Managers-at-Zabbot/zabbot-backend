import { errorUtilities } from "../../../shared/utilities";
import { LanguageAttributes } from "../data-types/interface";
import Languages from "../entities/language";
import LanguageContents from "../entities/language-content";


const languageRepositories = {
  // LANGUAGE SESSION START
  getLanguages: async (filter?: {isActive: boolean}) => {
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
  },

  getLanguage: async (id: string) => {
    try {
      const language = await Languages.findByPk(id);

      return language;

    } catch (error: any) {
      throw errorUtilities.createError(`Error Fetching language: ${error.message}`, 500);
    }
  },

  getLanguageByCode: async (code: string) => {
    try {
      const language = await Languages.findOne({ where: { code } });
      if (!language) {
        throw errorUtilities.createError(`Language with code ${code} not found`, 404);
      }

      return language;

    } catch (error: any) {
      throw errorUtilities.createError(`Error Fetching language by code: ${error.message}`, 500);
    }
  },

  addLanguage: async (languageData: LanguageAttributes) => {
    try {
      // Create a new language
      const newLanguage = await Languages.create({
        code: languageData.code,
        title: languageData.title,
        isActive: true
      });

      return newLanguage;

    } catch (error: any) {
      throw errorUtilities.createError(`Error Adding language: ${error.message}`, 500);
    }
  },

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
  },

  deleteLanguage: async (id: string) => {
    try {
      await Languages.destroy({ where: { id } });

      return { message: "Language deleted successfully" };

    } catch (error: any) {
      throw errorUtilities.createError(`Error Deleting language: ${error.message}`, 500);
    }
  },
  // END LANGUAGE SESSION


  // TOGGLE LANGUAGE STATUS
  toggleLanguageStatus: async (id: string) => {
    const language = await Languages.findByPk(id);
    if (!language)
      throw errorUtilities.createError(`Language does not exist`, 404);

    if (language.isActive === undefined || language.isActive === null)
      language.isActive = true;
      
    language.isActive = !language.isActive;

    // Update the language
    const updatedLanguage = await Languages.update( language, { where: { id } });

    return updatedLanguage;  
  },

  // SESSION FOR LANGUAGE CONTENTS
  getLanguageContents: async () => {
    try {
      const languageContents = await LanguageContents.findAll();
    
      return languageContents;

    } catch (error: any) {
      throw errorUtilities.createError(`Error fetching language contents: ${error.message}`, 500);
    }
  },

  getLanguageContent: async (languageId: string) => {
    try {
      const languageContent = await LanguageContents.findOne({ where: { languageId } });
      if (!languageContent)
        throw errorUtilities.createError(`No contents found for this language`, 404);
      

      return languageContent;

    } catch (error: any) {
      throw errorUtilities.createError(`Error fetching contents for this language: ${error.message}`, 500);
    }
  },

  addLanguageContent: async (languageContentData: any) => {
    try {
      // Create a new language content
      const newLanguageContent = await LanguageContents.create({
        languageId: languageContentData.languageId,
        title: languageContentData.title,
        word: languageContentData.word,
        tone: languageContentData.tone,
        createdAt: new Date()
      });

      return newLanguageContent;

    } catch (error: any) {

      throw errorUtilities.createError(`Error creating a new language content: ${error.message}`, 500);
    }
  },

  updateLanguageContent: async (id: string, languageContentData: any) => {
    try {
      // Check if the language content exists
      const currentLanguageContent = await LanguageContents.findByPk(id);
      if (!currentLanguageContent) {
        throw errorUtilities.createError(`Language content does not exist`, 404);
      }

      currentLanguageContent.title = languageContentData.title;
      currentLanguageContent.word = languageContentData.word;
      currentLanguageContent.tone = languageContentData.tone;
      currentLanguageContent.updatedAt = new Date();

      // Update the language content
      const updatedLanguageContent = await LanguageContents.update( currentLanguageContent, { where: { id } });

      return updatedLanguageContent;

    } catch (error: any) {
      throw errorUtilities.createError(`Error Updating language content: ${error.message}`, 500);
    }
  }
  // END LANGUAGE CONTENTS SESSION
}

export default languageRepositories;