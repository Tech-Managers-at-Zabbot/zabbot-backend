import { v4 } from "uuid";
import { LessonAttributes } from "../../data-types/interface"
import lessonRepositories from "../../repositories/lesson.repository"
import { errorUtilities, responseUtilities } from "../../../../shared/utilities";
import { StatusCodes } from "../../../../shared/statusCodes/statusCodes.responses";
import contentRepositories from "../../repositories/content.repository";
// import languageRepositories from "src/repositories/language.repository";

const getLessons = errorUtilities.withServiceErrorHandling(
  async () => {
    const lessons = await lessonRepositories.getLessons();
    return responseUtilities.handleServicesResponse(StatusCodes.OK, "", lessons);
  }
);

const getLesson = errorUtilities.withServiceErrorHandling (
  async (id: string) => {
    const lesson = await lessonRepositories.getLesson(id);
    if (!lesson) {
      throw errorUtilities.createError(`Lesson not found`, 404);
    }

    return responseUtilities.handleServicesResponse(StatusCodes.OK, "", lesson);
  }
);

const getLessonWithContents = errorUtilities.withServiceErrorHandling (
  async (lessonId: string) => {
    const lesson = await lessonRepositories.getLesson(lessonId);
    if (!lesson) {
      throw errorUtilities.createError(`Lesson not found`, 404);
    }

    const contents = await contentRepositories.getLessonContents(lessonId)

    return responseUtilities.handleServicesResponse(StatusCodes.OK, "Successful", {lesson, contents});
  }
);

const createLesson = errorUtilities.withServiceErrorHandling(
  async (lessonData: LessonAttributes) => {
    const payload = {
      ...lessonData,
      id: v4(),
      createdAt: new Date(),
      lessonOutcomes: lessonData.outcomes,
      lessonObjectives: lessonData.objectives,
      estimatedDuration: lessonData.estimatedDuration || 0,
    }
    const newLesson = await lessonRepositories.addLesson(payload);
    return responseUtilities.handleServicesResponse(StatusCodes.Created, "Lesson created successfully", newLesson);
  }
);

const updateLesson = errorUtilities.withServiceErrorHandling(
  async (id: string, lessonData: LessonAttributes) => {
    const lesson = await lessonRepositories.getLesson(id);
    if (!lesson) 
      throw errorUtilities.createError(`Lesson not found`, 404);

    lesson.updatedAt = new Date();
    lesson.title = lessonData.title;
    lesson.description = lessonData.description;

    const updatedLesson = await lessonRepositories.updateLesson(lesson);

    return updatedLesson;
  }
);

//Logic for deleting a lesson is not ready yet
// const deleteLesson = errorUtilities.withServiceErrorHandling(
//   async (id: string) => {
//     const deletedLesson = await lessonRepositories.deleteLesson(id);
//     if (!deletedLesson) {
//       throw errorUtilities.createError(`Lesson not found`, 404);
//     }
//     return deletedLesson;
//   }
// );
// Add this to your course service exports:

export default {
  getLessons,
  getLesson,
  createLesson,
  updateLesson,
  getLessonWithContents
}