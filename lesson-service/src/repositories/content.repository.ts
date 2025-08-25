import Contents from "../../../shared/entities/lesson-service-entities/content/content";
import { errorUtilities } from "../../../shared/utilities";
import ContentFiles from "../../../shared/entities/lesson-service-entities/contentFile/content-file";
import { Sequelize, Transaction } from "sequelize";

const contentRepositories = {

  // CRUD CONTENTS SESSION START
  getContents: async () => {
    try {
      const contents = await Contents.findAll();
    
      return contents;
    } catch (error: any) {
      throw errorUtilities.createError(`Error fetching contents ${error.message}`, 500);
    }
  },

  getContent: async (id: string) => {
    try {
      const content = await Contents.findByPk(id);
      return content;

    } catch (error: any) {
      throw errorUtilities.createError(`Error fetching content: ${error.message}`, 500);
    }
  },

  // getLessonContents: async (lessonId: string) => {
  //   try {
  //     const contents = await Contents.findAll({ where: { lessonId }, raw: true });
  //     return contents;

  //   } catch (error: any) {
  //     throw errorUtilities.createError(`Error fetching contents for this lesson: ${error.message}`, 500);
  //   }
  // },

getLessonContents: async (lessonId: string) => {
  try {
    const contents = await Contents.findAll({ where: { lessonId }, raw: true });
    
    const sortedContents = contents.sort((a:Record<string, any>, b:Record<string, any>) => {
      const getPriority = (content: any) => {
        if (content.contentType === 'normal') return 1;
        if (content.isGrammarRule === true) return 2;
        if (content.contentType === 'proverbs') return 3;
        return 4;
      };
      
      const priorityA = getPriority(a);
      const priorityB = getPriority(b);
      
      if (priorityA !== priorityB) {
        return priorityA - priorityB;
      }
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });
    
    return sortedContents;
  } catch (error: any) {
    throw errorUtilities.createError(`Error fetching contents for this lesson: ${error.message}`, 500);
  }
},



  getLanguageContents: async (languageId: string) => {
    try {
      const contents = await Contents.findAll({ where: { languageId }, raw: true });
      return contents;

    } catch (error: any) {
      throw errorUtilities.createError(`Error fetching contents for this language: ${error.message}`, 500);
    }
  },

  createContent: async (contentData: any, transaction?: Transaction) => {
    try {
      // Create a new content
      const newContent = await Contents.create(contentData, { transaction });

      return newContent;

    } catch (error: any) {
      throw errorUtilities.createError(`Error creating a new content: ${error.message}`, 500);
    }
  },

  updateContent: async (contentData: any, transaction?: Transaction) => {
    try {
      // Update the content
      const updatedContent = await contentData.update(contentData, { transaction });

      return updatedContent;

    } catch (error: any) {
      throw errorUtilities.createError(`Error updating content: ${error.message}`, 500);
    }
  },

  deleteContent: async (id: string) => {
    try {
      // Check if the content exists
      const currentContent = await Contents.findByPk(id);
      if (!currentContent) {
        throw errorUtilities.createError(`Content does not exist`, 404);
      }

      // Delete the content
      await Contents.destroy({ where: { id } });

      return { message: "Content deleted successfully" };

    } catch (error: any) {
      throw errorUtilities.createError(`Error deleting content: ${error.message}`, 500);
    }
  },
  // CRUD CONTENTS SESSION END

  getContentFiles: async (contentId: string) => {
    try {
      const contentFiles = await ContentFiles.findAll({ where: { contentId }, raw: true });

      return contentFiles;

    } catch (error: any) {
      throw errorUtilities.createError(`Error fetching files for this content: ${error.message}`, 500);
    }
  },

  createContentFile: async (contentFileData: any, transaction?: Transaction) => {
  try {
    const newContentFile = await ContentFiles.create(contentFileData, { transaction });
    return newContentFile;
  } catch (error: any) {
    throw errorUtilities.createError(`Error creating content file: ${error.message}`, 500);
  }
},
}

export default contentRepositories;