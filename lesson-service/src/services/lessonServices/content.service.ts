import lessonRepositories from "src/repositories/lesson.repository";
import { errorUtilities } from "../../../../shared/utilities";
import contentRepositories from "../../repositories/content.repository"

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
    if (!lesson) {
      throw errorUtilities.createError(`Lesson not found`, 404);
    }

    const contents = await contentRepositories.getLessonContents(lessonId);
    return contents;
  }
);

const addContent = errorUtilities.withServiceErrorHandling (
  async (contentData: any) => {
    const newContent = await contentRepositories.createContent(contentData);
    return newContent;
  }
);

const updateContent = errorUtilities.withServiceErrorHandling (
  async (id: string, contentData: any) => {
    const content = await contentRepositories.getContent(id);
    if (!content) {
      throw errorUtilities.createError(`Content not found`, 404);
    }

    const updatedContent = await contentRepositories.updateContent(id, contentData);
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