import { errorUtilities } from "../../../shared/utilities";
import { LessonAttributes } from "src/data-types/interface";
import Lessons from "src/entities/lesson";

getLessons: async () => {
  try {
    const lessons = await Lessons.findAll();

    return lessons;
  } catch (error: any) {
      throw errorUtilities.createError(`Error Fetching lessons: ${error.message}`, 500);
  }
}

getLesson: async (id: string) => {
  try {
    const lesson = await Lessons.findByPk(id);

    return lesson;

  } catch (error: any) {

    throw errorUtilities.createError(`Error Fetching lesson: ${error.message}`, 500);
  }
}

addLesson: async (lessonData: LessonAttributes) => {
  try {
    // Create a new lesson
    const newLesson = await Lessons.create({
      title: lessonData.title,
      description: lessonData.description,
      createdAt: new Date()
    });

    return newLesson;

  } catch (error: any) {

    throw errorUtilities.createError(`Error creating a new lesson: ${error.message}`, 500);
  }
}

updateLesson: async (id: string, lessonData: LessonAttributes) => {
  try {
    // Check if the language exists
    const currentLesson = await Lessons.findByPk(id);
    if (!currentLesson) {
      throw errorUtilities.createError(`Lesson does not exist`, 404);
    }

    currentLesson.title = lessonData.title;
    currentLesson.description = lessonData.description;
    currentLesson.updatedAt = new Date();

    // Update the language
    const updatedLesson = await Lessons.update( currentLesson, { where: { id } });

    return updatedLesson;

  } catch (error: any) {

    throw errorUtilities.createError(`Error Updating lesson: ${error.message}`, 500);
  }
}