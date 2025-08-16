import lessonRepositories from "../../repositories/lesson.repository";
import { errorUtilities, responseUtilities } from "../../../../shared/utilities";
import contentRepositories from "../../repositories/content.repository"
<<<<<<< HEAD
import { v4 } from "uuid";
import { FileContentAttributes } from "../../data-types/interface";
=======
import { StatusCodes } from "../../../../shared/statusCodes/statusCodes.responses";
import { CourseResponses } from "../../responses/responses";
import { v4 } from "uuid";
import { create } from "ts-node";
>>>>>>> 2f02c363aeb6a6515fd726c55e0d04a284f89bdb

const getContents = errorUtilities.withServiceErrorHandling(
  async () => {
    const getContents = await contentRepositories.getContents();
    if (!getContents) {
      throw errorUtilities.createError(
        CourseResponses.CONTENTS_NOT_FOUND,
        StatusCodes.NotFound
      );
    }
    return responseUtilities.handleServicesResponse(
      StatusCodes.OK,
      CourseResponses.PROCESS_SUCCESSFUL,
      getContents
    );
  }
);

const getContentsForLanguage = errorUtilities.withServiceErrorHandling(
  async (languageId: string) => {
    const getLanguageContents = await contentRepositories.getLanguageContents(languageId);
    if (!getLanguageContents) {
      throw errorUtilities.createError(
        CourseResponses.CONTENTS_NOT_FOUND,
        StatusCodes.NotFound
      );
    }
    return responseUtilities.handleServicesResponse(
      StatusCodes.OK,
      CourseResponses.PROCESS_SUCCESSFUL,
      getLanguageContents
    );
  }
);

const getContent = errorUtilities.withServiceErrorHandling(
  async (id: string) => {
    const content = await contentRepositories.getContent(id);
    if (!content) {
      throw errorUtilities.createError(`Content not found`, 404);
    }

    return content;
  }
);

const getLessonContents = errorUtilities.withServiceErrorHandling(
  async (lessonId: string) => {
    const lesson = await lessonRepositories.getLesson(lessonId);
    if (!lesson)
      throw errorUtilities.createError(`Lesson not found`, 404);

    const contents = await contentRepositories.getLessonContents(lessonId);
    return contents;
  }
);

const addContent = errorUtilities.withServiceErrorHandling(
  async (contentData: any) => {
    const lesson = await lessonRepositories.getLesson(contentData.lessonId);
    if (!lesson)
      throw errorUtilities.createError(`Lesson not found`, 404);

    const payload = {
      id: v4(),
      lessonId: contentData.lessonId,
      languageId: contentData.languageId,
      translation: contentData.translation,
      level: contentData.level,
      createdAt: new Date()
    }

    const newContent = await contentRepositories.createContent(payload);
    
    let fileContents = contentData.contentFiles as FileContentAttributes[];
    if (fileContents) {
      fileContents.forEach(item => {
        item.contentId = newContent.id;
      });

      await contentRepositories.createMultipleContents(fileContents);
    }
    
    return newContent;
  }
);

const updateContent = errorUtilities.withServiceErrorHandling(
  async (id: string, contentData: any) => {
    const content = await contentRepositories.getContent(id);
    if (!content) {
      throw errorUtilities.createError(`Content not found`, 404);
    }

    content.lessonId = contentData.lessonId;
    content.languageId = contentData.languageId;
    content.translation = contentData.translation;
    content.updatedAt = new Date();

    const updatedContent = await contentRepositories.updateContent(content);
    return updatedContent;
  }
);

const deleteContent = errorUtilities.withServiceErrorHandling(
  async (id: string) => {
    const content = await contentRepositories.getContent(id);
    if (!content) {
      throw errorUtilities.createError(`Content not found`, 404);
    }

    await contentRepositories.deleteContent(id);

    return { message: "Content deleted successfully" };
  }
);

const addContentFile = errorUtilities.withServiceErrorHandling(
  async (contentData: any) => {
    if (Array.isArray(contentData)) {
      const created: Record<string, any>[] = []
      const failed: { data: Record<string, any>; reason: string }[] = [];
      await Promise.all(
        contentData.map(async (data) => {
          try {
            const createdFile = await contentRepositories.createContentFile({...data, id: v4(), createdAt: new Date()});
            if (createdFile) {
              created.push(createdFile);
            } else {
              failed.push({ data, reason: 'Unknown creation failure (no result returned)' });
            }
          } catch (error: any) {
            failed.push({
              data,
              reason: error?.message || 'Unknown error during creation',
            });
          }
        })
      );

      return responseUtilities.handleServicesResponse(
        StatusCodes.MultiStatus,
        CourseResponses.PROCESS_COMPLETED,
        { created, failed }
      );

    } else {
      const newContentFile = await contentRepositories.createContentFile(contentData);
      if (!newContentFile) {
        throw errorUtilities.createError(
          CourseResponses.PROCESS_UNSUCCESSFUL,
          StatusCodes.NotImplemented
        );
      }
      return responseUtilities.handleServicesResponse(
        StatusCodes.Created,
        CourseResponses.PROCESS_SUCCESSFUL,
        newContentFile
      );
    }
  }
);

export default {
  getContents,
  getContent,
  getLessonContents,
  addContent,
  updateContent,
  deleteContent,
  getContentsForLanguage,
  addContentFile
}