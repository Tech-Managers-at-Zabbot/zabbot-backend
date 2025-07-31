import lessonRepositories from "../../repositories/lesson.repository";
import { errorUtilities } from "../../../../shared/utilities";
import contentRepositories from "../../repositories/content.repository"
import { v4 } from "uuid";
import { FileContentAttributes } from "../../data-types/interface";

const getContents = errorUtilities.withServiceErrorHandling (
    async () => {
        const getContents = await contentRepositories.getContents();
        return getContents;
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
      id: v4(),
      lessonId: contentData.lessonId,
      languageContentId: contentData.languageContentId,
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

const updateContent = errorUtilities.withServiceErrorHandling (
  async (id: string, contentData: any) => {
    const content = await contentRepositories.getContent(id);
    if (!content) {
      throw errorUtilities.createError(`Content not found`, 404);
    }

    content.lessonId = contentData.lessonId;
    content.languageContentId = contentData.languageContentId;
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
  deleteContent
}