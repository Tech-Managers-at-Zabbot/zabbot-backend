import courseRepositories from "../../repositories/course.repository";
import {
  errorUtilities,
  responseUtilities,
} from "../../../../shared/utilities";
import { v4 } from "uuid";
import { StatusCodes } from "../../../../shared/statusCodes/statusCodes.responses";
import contentRepositories from "../../repositories/content.repository";
import lessonRepositories from "../../repositories/lesson.repository";
import quizRepositories from "../../repositories/quiz.repository";
import userCourseRepositories from "../../repositories/user-course.repository";
import { CourseResponses } from "../../responses/responses";
import { uploadFile } from "../../../../shared/cloudinary/api";
import languageRepositories from "../../repositories/language.repository";
import { users_service_db } from "../../../../config/databases";

const getCoursesForLanguage = errorUtilities.withServiceErrorHandling(
  async (languageId: string, isActive?: boolean) => {
    // const payload = { isActive, languageId };
    const courses = await courseRepositories.getCourses(isActive, languageId);
    if (!courses) {
      throw errorUtilities.createError(
        CourseResponses.COURSES_NOT_FETCHED,
        StatusCodes.NotFound,
      );
    }
    return responseUtilities.handleServicesResponse(
      StatusCodes.OK,
      CourseResponses.PROCESS_SUCCESSFUL,
      courses,
    );
  },
);

const getCourse = errorUtilities.withServiceErrorHandling(
  async (id: string, projections?: string[]) => {
    const course = await courseRepositories.getCourse(id, projections);
    if (!course) {
      throw errorUtilities.createError(
        CourseResponses.COURSE_NOT_FOUND,
        StatusCodes.NotFound,
      );
    }

    return responseUtilities.handleServicesResponse(
      StatusCodes.OK,
      CourseResponses.PROCESS_SUCCESSFUL,
      course,
    );
  },
);

const getCourseByTitle = errorUtilities.withServiceErrorHandling(
  async (title: string) => {
    const course = await courseRepositories.getCourseByTitle(title);
    if (!course) {
      throw errorUtilities.createError(
        `Course with title ${title} not found`,
        404,
      );
    }

    return course;
  },
);

const addCourse = errorUtilities.withServiceErrorHandling(
  async (courseData: any) => {
    const existingCourse = await courseRepositories.getCourseByTitle(
      courseData.title,
    );
    if (existingCourse) {
      throw errorUtilities.createError(
        `Course with title ${courseData.title} already exists`,
        400,
      );
    }

    const newCourse = await courseRepositories.addCourse(courseData);
    return newCourse;
  },
);

const updateCourse = errorUtilities.withServiceErrorHandling(
  async (id: string, courseData: any) => {
    const course = await courseRepositories.getCourse(id);
    if (!course) {
      throw errorUtilities.createError(
        CourseResponses.COURSE_NOT_FOUND,
        StatusCodes.NotFound,
      );
    }
    const updatedCourse = await courseRepositories.updateCourse(id, courseData);
    return responseUtilities.handleServicesResponse(
      StatusCodes.OK,
      CourseResponses.PROCESS_SUCCESSFUL,
      updatedCourse,
    );
  },
);

const deleteCourse = errorUtilities.withServiceErrorHandling(
  async (id: string) => {
    const course = await courseRepositories.getCourse(id);
    if (!course) {
      throw errorUtilities.createError(
        CourseResponses.COURSE_NOT_FOUND,
        StatusCodes.NotFound,
      );
    }

    await users_service_db.transaction(async (transaction) => {
      const lessons = await lessonRepositories.getLessonsOnly(id, transaction);
      const lessonIds = lessons.map((lesson: any) => lesson.id);

      if (lessonIds.length > 0) {
        await contentRepositories.deleteContentsByLessonIds(lessonIds, transaction);
      }

      await quizRepositories.deleteQuizzesByCourseId(id, transaction);
      await userCourseRepositories.deleteUserCoursesByCourseId(id, transaction);
      await lessonRepositories.deleteLessonsByCourseId(id, transaction);
      await courseRepositories.deleteCourse(id, transaction);
    });

    return responseUtilities.handleServicesResponse(
      StatusCodes.OK,
      CourseResponses.PROCESS_SUCCESSFUL,
      null,
    );
  },
);

const getCourseWithLessonsService = errorUtilities.withServiceErrorHandling(
  async (languageId: string) => {
    const course = await courseRepositories.getCourseWithLanguageId(languageId);
    console.log("course", course);
    if (!course) {
      throw errorUtilities.createError(
        CourseResponses.COURSE_NOT_FOUND,
        StatusCodes.NotFound,
      );
    }
    const lessons = await lessonRepositories.getLessonsOnly(course.id);
    return responseUtilities.handleServicesResponse(
      StatusCodes.OK,
      CourseResponses.PROCESS_SUCCESSFUL,
      { course, lessons },
    );
  },
);

const createCourseWithLessons = errorUtilities.withServiceErrorHandling(
  async (courseData, lessons, languageId) => {
    // const { lessons, languageId, ...courseData } = coursePayload;
    // Create course
    const newCourseData = {
      title: courseData.title,
      description: courseData.description,
      level: courseData.level,
      estimatedDuration: courseData.estimatedDuration,
      thumbnailImage: courseData.thumbnailImage,
      id: v4(),
      isActive: true,
      languageId,
      createdAt: new Date(),
      totalLessons: lessons?.length || 0,
      totalContents:
        lessons?.reduce(
          (total: number, lesson: any) =>
            total + (lesson.contents?.length || 0),
          0,
        ) || 0,
    };

    const newCourse = await courseRepositories.addCourse(newCourseData);

    if (lessons && lessons.length > 0) {
      for (const lessonData of lessons) {
        const { contents, ...lesson } = lessonData;

        // Create lesson
        const newLessonData = {
          ...lesson,
          id: v4(),
          courseId: newCourseData.id,
          createdAt: new Date(),
          totalContents: contents?.length || 0,
          languageId,
          outcomes: lesson.outcomes,
          objectives: lesson.objectives,
          estimatedDuration: lesson.estimatedTime || 0,
          headLineTag: lesson.headlineTag,
        };

        const createdLesson = await lessonRepositories.addLesson(newLessonData);

        if (contents && contents.length > 0) {
          for (const contentData of contents) {
            // Create content
            const newContentData = {
              id: v4(),
              lessonId: newLessonData.id,
              translation: contentData.translation,
              isGrammarRule: false,
              languageId,
              sourceType: contentData.sourceType,
              customText: contentData.customText,
              ededunPhrases: contentData.ededunPhrases,
              createdAt: new Date(),
            };

            const createdContent =
              await contentRepositories.createContent(newContentData);

            // Create content files
            if (
              contentData.contentFiles &&
              contentData.contentFiles.length > 0
            ) {
              for (const fileData of contentData.contentFiles) {
                const contentFileData = {
                  id: v4(),
                  contentId: newContentData.id,
                  contentType: fileData.contentType,
                  filePath: fileData.filePath,
                  description: fileData.description || null,
                  createdAt: new Date(),
                };

                await contentRepositories.createContentFile(contentFileData);
              }
            }
          }
        }
      }
    }

    return responseUtilities.handleServicesResponse(
      StatusCodes.Created,
      "Course created successfully with lessons",
      newCourse,
    );
  },
);

const updateCourseImageService = errorUtilities.withServiceErrorHandling(
  async (courseId: string, mediaType: string, files: Record<string, any>[]) => {
    const category = "course-images";
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
      thumbnailImage: successfulUploads[0].secure_url,
    };

    const updateImage = courseRepositories.updateCourse(courseId, updateData);

    if (!updateImage) {
      throw errorUtilities.createError(
        "Unable to update course",
        StatusCodes.BadRequest,
      );
    }
    return responseUtilities.handleServicesResponse(
      StatusCodes.OK,
      "Course updated successfully",
      updateImage,
    );
  },
);

export default {
  getCoursesForLanguage,
  getCourse,
  getCourseByTitle,
  addCourse,
  updateCourse,
  deleteCourse,
  createCourseWithLessons,
  getCourseWithLessonsService,
  updateCourseImageService,
};
