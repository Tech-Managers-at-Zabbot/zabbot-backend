import { v4 } from "uuid";
import lessonRepositories from "../../repositories/lesson.repository";
import {
  errorUtilities,
  responseUtilities,
} from "../../../../shared/utilities";
import { StatusCodes } from "../../../../shared/statusCodes/statusCodes.responses";
import contentRepositories from "../../repositories/content.repository";
import { CourseResponses } from "../../responses/responses";
import quizRepositories from "../../repositories/quiz.repository";
import { uploadFile } from "../../../../shared/cloudinary/api";
import courseRepositories from "../../repositories/course.repository";
import { users_service_db } from "../../../../config/databases";
// import languageRepositories from "src/repositories/language.repository";

const getLessons = errorUtilities.withServiceErrorHandling(async () => {
  const lessons = await lessonRepositories.getLessons();
  return responseUtilities.handleServicesResponse(StatusCodes.OK, "", lessons);
});

const getLesson = errorUtilities.withServiceErrorHandling(
  async (id: string) => {
    const lesson = await lessonRepositories.getLesson(id);
    if (!lesson) {
      throw errorUtilities.createError(`Lesson not found`, 404);
    }

    return responseUtilities.handleServicesResponse(StatusCodes.OK, "", lesson);
  },
);

const getLessonsForLanguage = errorUtilities.withServiceErrorHandling(
  async (languageId: string) => {
    const getLanguageLessons =
      await lessonRepositories.getLanguageLessons(languageId);
    if (!getLanguageLessons) {
      throw errorUtilities.createError(
        CourseResponses.LESSONS_NOT_FOUND,
        StatusCodes.NotFound,
      );
    }
    return responseUtilities.handleServicesResponse(
      StatusCodes.OK,
      CourseResponses.PROCESS_SUCCESSFUL,
      getLanguageLessons,
    );
  },
);

const getLessonsForCourse = errorUtilities.withServiceErrorHandling(
  async (courseId: string) => {
    const getCourseLessons = await lessonRepositories.getLessons({ courseId });
    const course = await courseRepositories.getCourse(courseId);
    if (!getCourseLessons) {
      throw errorUtilities.createError(
        CourseResponses.LESSONS_NOT_FOUND,
        StatusCodes.NotFound,
      );
    }

    const getLessonsContents = await Promise.all(
      getCourseLessons.map(async (lesson: Record<string, any>) => {
        const contents = await contentRepositories.getLessonContents(
          lesson?.id,
        );
        return {
          course: course || null,
          ...lesson,
          contents: contents || [],
        };
      }),
    );
    return responseUtilities.handleServicesResponse(
      StatusCodes.OK,
      CourseResponses.PROCESS_SUCCESSFUL,
      getLessonsContents,
    );
  },
);

const getLessonWithContents = errorUtilities.withServiceErrorHandling(
  async (lessonId: string) => {
    const lesson = await lessonRepositories.getLesson(lessonId);
    if (!lesson) {
      throw errorUtilities.createError(`Lesson not found`, 404);
    }

    const contentsData = await contentRepositories.getLessonContents(lessonId);

    const contents = await Promise.all(
      contentsData.map(async (content: Record<string, any>) => {
        const contentFiles = await contentRepositories.getContentFiles(
          content.id,
        );
        return {
          ...content,
          files: contentFiles,
        };
      }),
    );

    const lessonQuizzes = await quizRepositories.getQuizzes({ lessonId });

    return responseUtilities.handleServicesResponse(
      StatusCodes.OK,
      "Successful",
      { lesson, contents, lessonQuizzes },
    );
  },
);

const createLesson = errorUtilities.withServiceErrorHandling(
  async (lessonData: Record<string, any>) => {
    const payload = {
      ...lessonData,
      id: v4(),
      createdAt: new Date(),
      lessonOutcomes: lessonData.outcomes,
      lessonObjectives: lessonData.objectives,
      estimatedDuration: lessonData.estimatedDuration || 0,
    };
    const newLesson = await lessonRepositories.addLesson(payload);
    return responseUtilities.handleServicesResponse(
      StatusCodes.Created,
      "Lesson created successfully",
      newLesson,
    );
  },
);

const updateLesson = errorUtilities.withServiceErrorHandling(
  async (id: string, lessonData: Record<string, any>) => {
    const lesson = await lessonRepositories.getLesson(id);
    if (!lesson) throw errorUtilities.createError(`Lesson not found`, 404);

    lesson.updatedAt = new Date();
    lesson.title = lessonData.title;
    lesson.description = lessonData.description;

    const updatedLesson = await lessonRepositories.updateLesson(lesson);

    return updatedLesson;
  },
);

const updateLessonImageService = errorUtilities.withServiceErrorHandling(
  async (lessonId: string, mediaType: string, files: Record<string, any>[]) => {
    const lesson = await lessonRepositories.getLesson(lessonId);
    if (!lesson) {
      throw errorUtilities.createError(`Lesson not found`, 404);
    }
    const category = "lesson-images";
    const uploadCourseImage: any = await uploadFile(category, mediaType, files);
    if (uploadCourseImage.status === "invalid") {
      throw errorUtilities.createError(
        uploadCourseImage.message,
        StatusCodes.BadRequest,
      );
    } else if (uploadCourseImage.status === "error") {
      throw errorUtilities.createError(
        uploadCourseImage.message,
        StatusCodes.InternalServerError,
      );
    }
    const successfulUploads = uploadCourseImage.data.successful;

    const updateData = {
      lessonImg: successfulUploads[0].secure_url,
    };
    const update = await lessonRepositories.newUpdateLesson(
      lessonId,
      updateData,
    );

    if (!update) {
      throw errorUtilities.createError(
        "Unable to update Lesson Image",
        StatusCodes.BadRequest,
      );
    }
    return responseUtilities.handleServicesResponse(
      StatusCodes.OK,
      "Lesson image updated successfully",
      update,
    );
  },
);

const deleteLesson = errorUtilities.withServiceErrorHandling(
  async (id: string) => {
    const lesson = await lessonRepositories.getLesson(id);
    if (!lesson) {
      throw errorUtilities.createError(
        CourseResponses.LESSON_NOT_FOUND,
        StatusCodes.NotFound,
      );
    }

    await users_service_db.transaction(async (transaction) => {
      await contentRepositories.deleteContentsByLessonIds([id], transaction);
      await quizRepositories.deleteQuizzesByLessonId(id, transaction);
      await lessonRepositories.deleteLesson(id, transaction);
    });

    return responseUtilities.handleServicesResponse(
      StatusCodes.OK,
      CourseResponses.PROCESS_SUCCESSFUL,
      null,
    );
  },
);

export default {
  getLessons,
  getLesson,
  createLesson,
  updateLesson,
  deleteLesson,
  getLessonWithContents,
  getLessonsForLanguage,
  getLessonsForCourse,
  updateLessonImageService,
};
