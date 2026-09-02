import Contents from "../../../shared/entities/lesson-service-entities/content/content";
import { errorUtilities } from "../../../shared/utilities";
import ContentFiles from "../../../shared/entities/lesson-service-entities/contentFile/content-file";
import { Op, Sequelize, Transaction } from "sequelize";

const contentRepositories = {
  // CRUD CONTENTS SESSION START
  getContents: async () => {
    try {
      const contents = await Contents.findAll();

      return contents;
    } catch (error: any) {
      throw errorUtilities.createError(
        `Error fetching contents ${error.message}`,
        500,
      );
    }
  },

  getContent: async (id: string) => {
    try {
      const content = await Contents.findByPk(id);
      return content;
    } catch (error: any) {
      throw errorUtilities.createError(
        `Error fetching content: ${error.message}`,
        500,
      );
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
      const contents = await Contents.findAll({
        where: { lessonId },
        raw: true,
      });

      const sortedContents = contents.sort(
        (a: Record<string, any>, b: Record<string, any>) => {
          const getPriority = (content: any) => {
            if (content.contentType === "normal") return 1;
            if (content.isGrammarRule === true) return 2;
            if (content.contentType === "proverbs") return 3;
            return 4;
          };

          const priorityA = getPriority(a);
          const priorityB = getPriority(b);

          if (priorityA !== priorityB) {
            return priorityA - priorityB;
          }
          return (
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
        },
      );

      return sortedContents;
    } catch (error: any) {
      throw errorUtilities.createError(
        `Error fetching contents for this lesson: ${error.message}`,
        500,
      );
    }
  },

  getLanguageContents: async (languageId: string) => {
    try {
      const contents = await Contents.findAll({
        where: { languageId },
        raw: true,
      });
      return contents;
    } catch (error: any) {
      throw errorUtilities.createError(
        `Error fetching contents for this language: ${error.message}`,
        500,
      );
    }
  },

  createContent: async (contentData: any, transaction?: Transaction) => {
    try {
      // Create a new content
      const newContent = await Contents.create(contentData, { transaction });

      return newContent;
    } catch (error: any) {
      throw errorUtilities.createError(
        `Error creating a new content: ${error.message}`,
        500,
      );
    }
  },

  updateContent: async (
    id: string,
    contentData: any,
    transaction?: Transaction,
  ) => {
    try {
      if (!id) {
        throw errorUtilities.createError("Content id is required", 400);
      }

      const payload = { ...contentData };
      delete payload.id;

      const [rowsUpdated, [updatedContent]] = await Contents.update(payload, {
        where: { id },
        returning: true,
        transaction,
      });

      if (rowsUpdated === 0) {
        throw errorUtilities.createError("No content updated", 400);
      }

      return updatedContent;
    } catch (error: any) {
      throw errorUtilities.createError(
        `Error updating content: ${error.message}`,
        500,
      );
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
      throw errorUtilities.createError(
        `Error deleting content: ${error.message}`,
        500,
      );
    }
  },
  deleteContentsByLessonIds: async (
    lessonIds: string[],
    transaction?: Transaction,
  ) => {
    try {
      const lessonIdsWhere: any = { lessonId: { [Op.in]: lessonIds } };
      const contents = await Contents.findAll({
        where: lessonIdsWhere,
        attributes: ["id"],
        raw: true,
        transaction,
      });
      const contentIds = contents.map((content: any) => content.id);

      if (contentIds.length > 0) {
        const contentIdsWhere: any = { contentId: { [Op.in]: contentIds } };
        await ContentFiles.destroy({
          where: contentIdsWhere,
          transaction,
        });
      }

      await Contents.destroy({
        where: lessonIdsWhere,
        transaction,
      });
    } catch (error: any) {
      throw errorUtilities.createError(
        `Error deleting contents for lessons: ${error.message}`,
        500,
      );
    }
  },
  // CRUD CONTENTS SESSION END

  getContentFiles: async (contentId: string) => {
    try {
      const contentFiles = await ContentFiles.findAll({
        where: { contentId },
        raw: true,
      });

      return contentFiles;
    } catch (error: any) {
      throw errorUtilities.createError(
        `Error fetching files for this content: ${error.message}`,
        500,
      );
    }
  },

  getContentFilesById: async (id: string) => {
    try {
      const contentFile = await ContentFiles.findByPk(id);
      return contentFile;
    } catch (error: any) {
      throw errorUtilities.createError(
        `Error fetching content file: ${error.message}`,
        500,
      );
    }
  },

  updateContentFile: async (id: string, contentFileData: any, transaction?: Transaction) => {
    try {
      if (!id) {
        throw errorUtilities.createError("Content file id is required", 400);
      }

      const payload = { ...contentFileData };
      delete payload.id;

      const [rowsUpdated, [updatedContentFile]] = await ContentFiles.update(payload, {
        where: { id },
        returning: true,
        transaction,
      });

      if (rowsUpdated === 0) {
        throw errorUtilities.createError("No content file updated", 400);
      }

      return updatedContentFile;
    } catch (error: any) {
      throw errorUtilities.createError(
        `Error updating content file: ${error.message}`,
        500,
      );
    }
  },

  deleteContentFile: async (id: string, transaction?: Transaction) => {
    try {
      const currentContentFile = await ContentFiles.findByPk(id, { transaction });
      if (!currentContentFile) {
        throw errorUtilities.createError("Content file does not exist", 404);
      }

      await ContentFiles.destroy({ where: { id }, transaction });

      return { message: "Content file deleted successfully" };
    } catch (error: any) {
      throw errorUtilities.createError(
        `Error deleting content file: ${error.message}`,
        500,
      );
    }
  },

  createContentFile: async (
    contentFileData: any,
    transaction?: Transaction,
  ) => {
    try {
      const newContentFile = await ContentFiles.create(contentFileData, {
        transaction,
      });
      return newContentFile;
    } catch (error: any) {
      throw errorUtilities.createError(
        `Error creating content file: ${error.message}`,
        500,
      );
    }
  },
};

export default contentRepositories;
