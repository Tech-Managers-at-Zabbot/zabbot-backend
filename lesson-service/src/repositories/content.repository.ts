import Contents from "../entities/content"
import { errorUtilities } from "../../../shared/utilities";
import ContentFiles from "../entities/content-file";
import { Transaction } from "sequelize";

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

  getLessonContents: async (lessonId: string) => {
    try {
      const contents = await Contents.findAll({ where: { lessonId } });
      return contents;

    } catch (error: any) {
      throw errorUtilities.createError(`Error fetching contents for this lesson: ${error.message}`, 500);
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

  createMultipleContents: async (contentsData: any[], transaction?: Transaction) => {
    try {
      // Create a new list of contents
      const newContents = await Contents.bulkCreate(contentsData, { transaction });

      return newContents;
    } catch (error: any) {
      throw errorUtilities.createError(`Error creating new contents: ${error.message}`, 500);
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
      const contentFiles = await ContentFiles.findAll({ where: { contentId } });

      return contentFiles || [];

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