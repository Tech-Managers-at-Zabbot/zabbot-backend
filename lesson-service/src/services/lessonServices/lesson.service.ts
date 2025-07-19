import { LessonAttributes } from "src/data-types/interface";
import { errorUtilities } from "../../../../shared/utilities";
import lessonRepositories from "../../repositories/lesson.repository"

const getLessons = errorUtilities.withServiceErrorHandling(
  async () => {
    const lessons = await lessonRepositories.getLessons();
    return lessons;
  }
);

const getLesson = errorUtilities.withServiceErrorHandling (
  async (id: string) => {
    const lesson = await lessonRepositories.getLesson(id);
    if (!lesson) {
      throw errorUtilities.createError(`Lesson not found`, 404);
    }

    return lesson;
  }
);

const addLesson = errorUtilities.withServiceErrorHandling(
  async (lessonData: LessonAttributes) => {
    const newLesson = await lessonRepositories.addLesson(lessonData);
    return newLesson;
  }
);

const updateLesson = errorUtilities.withServiceErrorHandling(
  async (id: string, lessonData: LessonAttributes) => {
    const updatedLesson = await lessonRepositories.updateLesson(id, lessonData);
    if (!updatedLesson) {
      throw errorUtilities.createError(`Lesson not found`, 404);
    }

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

export default {
  getLessons,
  getLesson,
  addLesson,
  updateLesson
}