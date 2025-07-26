import { Transaction } from "sequelize";
import { errorUtilities } from "../../../shared/utilities";
import Languages from "../entities/language";
import LanguageContents from "../entities/language-content";


const languageRepositories = {
  // LANGUAGE SESSION START
  getLanguages: async (filter?: { isActive: boolean }) => {
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

      return language;

    } catch (error: any) {
      throw errorUtilities.createError(`Error Fetching language by code: ${error.message}`, 500);
    }
  },

  addLanguage: async (languageData: any, transaction?: Transaction) => {
    try {
      // Create a new language
      const newLanguage = await Languages.create(languageData, { transaction });

      return newLanguage;

    } catch (error: any) {
      throw errorUtilities.createError(`Error Adding language: ${error.message}`, 500);
    }
  },

  updateLanguage: async (languageData: any, transaction?: Transaction) => {
    try {
      // Update the language
      await languageData.update( languageData, { transaction });

      return languageData;

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
  getLanguageContents: async (filter?: { languageId?: string}) => {
    try {
      const where: any = {}
      if (typeof filter?.languageId === 'string')
        where.languageId = filter?.languageId
      
      const languageContents = await LanguageContents.findAll({ where });
    
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
      
      // currentLanguageContent.title = languageContentData.title;
      // currentLanguageContent.word = languageContentData.word;
      // currentLanguageContent.tone = languageContentData.tone;
      languageContentData.updatedAt = new Date();

      // Update the language content
      const updatedLanguageContent = await LanguageContents.update( languageContentData, { where: { id } });

      return updatedLanguageContent;

    } catch (error: any) {
      throw errorUtilities.createError(`Error Updating language content: ${error.message}`, 500);
    }
  },

  deleteLanguageContent: async(id: string) => {
    try{
      await LanguageContents.destroy({ where: { id }});
      return { message: "Language content deleted successfully"};

    } catch (error) {
      throw errorUtilities.createError(`Error deleting Language content`, 500);
    }
  }
  // END LANGUAGE CONTENTS SESSION
}

export default languageRepositories;