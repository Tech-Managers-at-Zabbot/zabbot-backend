import Contents from "src/entities/content"
import { errorUtilities } from "../../../shared/utilities";
import ContentFiles from "src/entities/content-file";

// CRUD CONTENTS SESSION START
getContents: async () => {
  try {
    const contents = await Contents.findAll();
  
    return contents;
  } catch (error: any) {
    throw errorUtilities.createError(`Error fetching contents ${error.message}`, 500);
  }
}

getLessonContents: async (lessonId: string) => {
  try {
    const lesson = await Contents.findByPk(lessonId);
    if (!lesson)
      throw errorUtilities.createError(`Lesson does not exist`, 500);

    const contents = await Contents.findAll({ where: { lessonId } });
  
    return contents;

  } catch (error: any) {
    throw errorUtilities.createError(`Error fetching contents for this lesson: ${error.message}`, 500);
  }
}

createContent: async (contentData: any) => {
  try {
    // Create a new content
    const newContent = await Contents.create({
      lessonId: contentData.lessonId,
      languageContentId: contentData.languageContentId,
      translation: contentData.translation,
      level: contentData.level,
      createdAt: new Date()
    });

    return newContent;

  } catch (error: any) {
    throw errorUtilities.createError(`Error creating a new content: ${error.message}`, 500);
  }
}

updateContent: async (id: string, contentData: any) => {
  try {
    // Check if the content exists
    const currentContent = await Contents.findByPk(id);
    if (!currentContent) {
      throw errorUtilities.createError(`Content does not exist`, 404);
    }

    currentContent.lessonId = contentData.lessonId;
    currentContent.languageContentId = contentData.languageContentId;
    currentContent.translation = contentData.translation;
    currentContent.level = contentData.level;
    currentContent.updatedAt = new Date();

    // Update the content
    const updatedContent = await Contents.update(currentContent, { where: { id } });

    return updatedContent;

  } catch (error: any) {
    throw errorUtilities.createError(`Error updating content: ${error.message}`, 500);
  }
}

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
}
// CRUD CONTENTS SESSION END

getContentFiles: async (contentId: string) => {
  try {
    const contentFiles = await ContentFiles.findAll({ where: { contentId } });

    return contentFiles || [];

  } catch (error: any) {
    throw errorUtilities.createError(`Error fetching files for this content: ${error.message}`, 500);
  }
}