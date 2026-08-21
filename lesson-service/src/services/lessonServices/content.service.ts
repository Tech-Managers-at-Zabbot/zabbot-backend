import lessonRepositories from "../../repositories/lesson.repository";
import {
  errorUtilities,
  responseUtilities,
} from "../../../../shared/utilities";
import contentRepositories from "../../repositories/content.repository";
import { StatusCodes } from "../../../../shared/statusCodes/statusCodes.responses";
import { ContentResponses, CourseResponses } from "../../responses/responses";
import { v4 } from "uuid";

const getContents = errorUtilities.withServiceErrorHandling(async () => {
  const getContents = await contentRepositories.getContents();
  if (!getContents) {
    throw errorUtilities.createError(
      CourseResponses.CONTENTS_NOT_FOUND,
      StatusCodes.NotFound,
    );
  }
  return responseUtilities.handleServicesResponse(
    StatusCodes.OK,
    CourseResponses.PROCESS_SUCCESSFUL,
    getContents,
  );
});

const getContentsForLanguage = errorUtilities.withServiceErrorHandling(
  async (languageId: string) => {
    const getLanguageContents =
      await contentRepositories.getLanguageContents(languageId);
    if (!getLanguageContents) {
      throw errorUtilities.createError(
        CourseResponses.CONTENTS_NOT_FOUND,
        StatusCodes.NotFound,
      );
    }
    return responseUtilities.handleServicesResponse(
      StatusCodes.OK,
      CourseResponses.PROCESS_SUCCESSFUL,
      getLanguageContents,
    );
  },
);

const getContent = errorUtilities.withServiceErrorHandling(
  async (id: string) => {
    const content = await contentRepositories.getContent(id);
    if (!content) {
      throw errorUtilities.createError(`Content not found`, 404);
    }

    return content;
  },
);

const getLessonContents = errorUtilities.withServiceErrorHandling(
  async (lessonId: string) => {
    const lesson = await lessonRepositories.getLesson(lessonId);
    if (!lesson) throw errorUtilities.createError(`Lesson not found`, 404);

    const contents = await contentRepositories.getLessonContents(lessonId);
    return contents;
  },
);

const addContent = errorUtilities.withServiceErrorHandling(
  async (contentData: any) => {
    const lesson = await lessonRepositories.getLesson(contentData.lessonId);
    if (!lesson) throw errorUtilities.createError(`Lesson not found`, 404);

    const payload = {
      lessonId: contentData.lessonId,
      languageId: contentData.languageId,
      translation: contentData.translation,
      level: contentData.level,
      createdAt: new Date(),
      id: v4(),
    };

    const newContent = await contentRepositories.createContent(payload);
    return responseUtilities.handleServicesResponse(
      StatusCodes.OK,
      ContentResponses.PROCESS_SUCCESSFUL,
      newContent,
    );
  },
);

const updateContent = errorUtilities.withServiceErrorHandling(
  async (id: string, contentData: any) => {
    const content = await contentRepositories.getContent(id);
    if (!content) {
      throw errorUtilities.createError(`Content not found`, 404);
    }

    const payload = {
      ...content.get({ plain: true }),
      ...contentData,
      id,
      updatedAt: new Date(),
    };

    const updatedContent = await contentRepositories.updateContent(id, payload);
    return responseUtilities.handleServicesResponse(
      StatusCodes.OK,
      ContentResponses.PROCESS_SUCCESSFUL,
      updatedContent,
    );
  },
);

const deleteContent = errorUtilities.withServiceErrorHandling(
  async (id: string) => {
    const content = await contentRepositories.getContent(id);
    if (!content) {
      throw errorUtilities.createError(`Content not found`, 404);
    }

    await contentRepositories.deleteContent(id);

    return responseUtilities.handleServicesResponse(
      StatusCodes.OK,
      ContentResponses.PROCESS_SUCCESSFUL,
    );
  },
);

const addContentFile = errorUtilities.withServiceErrorHandling(
  async (contentData: any) => {
    if (Array.isArray(contentData)) {
      const created: Record<string, any>[] = [];
      const failed: { data: Record<string, any>; reason: string }[] = [];
      await Promise.all(
        contentData.map(async (data) => {
          try {
            const createdFile = await contentRepositories.createContentFile({
              ...data,
              id: v4(),
              createdAt: new Date(),
            });
            if (createdFile) {
              created.push(createdFile);
            } else {
              failed.push({
                data,
                reason: "Unknown creation failure (no result returned)",
              });
            }
          } catch (error: any) {
            failed.push({
              data,
              reason: error?.message || "Unknown error during creation",
            });
          }
        }),
      );

      return responseUtilities.handleServicesResponse(
        StatusCodes.MultiStatus,
        CourseResponses.PROCESS_COMPLETED,
        { created, failed },
      );
    } else {
      const newContentFile = await contentRepositories.createContentFile({
        ...contentData,
        id: v4(),
        createdAt: new Date(),
      });
      if (!newContentFile) {
        throw errorUtilities.createError(
          CourseResponses.PROCESS_UNSUCCESSFUL,
          StatusCodes.NotImplemented,
        );
      }
      return responseUtilities.handleServicesResponse(
        StatusCodes.Created,
        CourseResponses.PROCESS_SUCCESSFUL,
        newContentFile,
      );
    }
  },
);

const updateContentFile = errorUtilities.withServiceErrorHandling(
  async (id: string, contentFileData: any) => {
    const contentFile = await contentRepositories.getContentFilesById(id);
    if (!contentFile) {
      throw errorUtilities.createError("Content file not found", 404);
    }

    const payload = {
      ...contentFile.get({ plain: true }),
      ...contentFileData,
      id,
      updatedAt: new Date(),
    };

    const updatedContentFile = await contentRepositories.updateContentFile(
      id,
      payload,
    );

    return responseUtilities.handleServicesResponse(
      StatusCodes.OK,
      CourseResponses.PROCESS_SUCCESSFUL,
      updatedContentFile,
    );
  },
);

const deleteContentFile = errorUtilities.withServiceErrorHandling(
  async (id: string) => {
    const contentFile = await contentRepositories.getContentFilesById(id);
    if (!contentFile) {
      throw errorUtilities.createError("Content file not found", 404);
    }

    await contentRepositories.deleteContentFile(id);

    return responseUtilities.handleServicesResponse(
      StatusCodes.OK,
      CourseResponses.PROCESS_SUCCESSFUL,
    );
  },
);

export default {
  getContents,
  getContent,
  getLessonContents,
  addContent,
  updateContent,
  deleteContent,
  getContentsForLanguage,
  addContentFile,
  updateContentFile,
  deleteContentFile,
};
