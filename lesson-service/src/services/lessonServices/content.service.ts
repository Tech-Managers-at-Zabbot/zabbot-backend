import lessonRepositories from "../../repositories/lesson.repository";
import { errorUtilities, responseUtilities } from "../../../../shared/utilities";
import contentRepositories from "../../repositories/content.repository"
import { StatusCodes } from "../../../../shared/statusCodes/statusCodes.responses";
import { CourseResponses } from "../../responses/responses";

const getContents = errorUtilities.withServiceErrorHandling (
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

const getContentsForLanguage = errorUtilities.withServiceErrorHandling (
  async (languageId:string) => {
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

const getContent = errorUtilities.withServiceErrorHandling (
  async (id: string) => {
    const content = await contentRepositories.getContent(id);
    if (!content) {
        throw errorUtilities.createError(`Content not found`, 404);
    }

    return content;
  }
);

const getLessonContents = errorUtilities.withServiceErrorHandling (
  async (lessonId: string) => {
    const lesson = await lessonRepositories.getLesson(lessonId);
    if (!lesson)
      throw errorUtilities.createError(`Lesson not found`, 404);

    const contents = await contentRepositories.getLessonContents(lessonId);
    return contents;
  }
);

const addContent = errorUtilities.withServiceErrorHandling (
  async (contentData: any) => {
    const lesson = await lessonRepositories.getLesson(contentData.lessonId);
    if (!lesson) 
      throw errorUtilities.createError(`Lesson not found`, 404);

    const payload = {
      lessonId: contentData.lessonId,
      languageId: contentData.languageId,
      translation: contentData.translation,
      level: contentData.level,
      createdAt: new Date()
    }

    const newContent = await contentRepositories.createContent(payload);
    return newContent;
  }
);

const updateContent = errorUtilities.withServiceErrorHandling (
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

const deleteContent = errorUtilities.withServiceErrorHandling (
  async (id: string) => {
    const content = await contentRepositories.getContent(id);
    if (!content) {
      throw errorUtilities.createError(`Content not found`, 404);
    }

    await contentRepositories.deleteContent(id);
    
    return { message: "Content deleted successfully" };
  }
);

export default {
  getContents,
  getContent,
  getLessonContents,
  addContent,
  updateContent,
  deleteContent,
  getContentsForLanguage
}