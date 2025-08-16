import courseRepositories from "../../repositories/course.repository";
import { errorUtilities, responseUtilities } from "../../../../shared/utilities";
import { v4 } from "uuid";
import { StatusCodes } from "../../../../shared/statusCodes/statusCodes.responses";
import contentRepositories from "../../repositories/content.repository";
import lessonRepositories from "../../repositories/lesson.repository";
import { Transaction } from "sequelize";
import { CourseResponses } from "../../responses/responses";

const getCoursesForLanguage = errorUtilities.withServiceErrorHandling(
  async (languageId: string, isActive?: boolean) => {
    // const payload = { isActive, languageId };
    const courses = await courseRepositories.getCourses(isActive, languageId);
    if (!courses) {
      throw errorUtilities.createError(
        CourseResponses.COURSES_NOT_FETCHED,
        StatusCodes.NotFound
      );
    }
    return responseUtilities.handleServicesResponse(
      StatusCodes.OK,
      CourseResponses.PROCESS_SUCCESSFUL,
      courses
    );
  }
);

const getCourse = errorUtilities.withServiceErrorHandling(
  async (id: string, projections?: string[]) => {
    const course = await courseRepositories.getCourse(id, projections);
    if (!course) {
      throw errorUtilities.createError(CourseResponses.COURSE_NOT_FOUND, StatusCodes.NotFound);
    }

    return responseUtilities.handleServicesResponse(
      StatusCodes.OK,
      CourseResponses.PROCESS_SUCCESSFUL,
      course
    );
  }
);

const getCourseByTitle = errorUtilities.withServiceErrorHandling(
  async (title: string) => {
    const course = await courseRepositories.getCourseByTitle(title);
    if (!course) {
      throw errorUtilities.createError(`Course with title ${title} not found`, 404);
    }

    return course;
  }
);

const addCourse = errorUtilities.withServiceErrorHandling(
  async (courseData: any) => {
    const existingCourse = await courseRepositories.getCourseByTitle(courseData.title);
    if (existingCourse) {
      throw errorUtilities.createError(`Course with title ${courseData.title} already exists`, 400);
    }

    const newCourse = await courseRepositories.addCourse(courseData);
    return newCourse;
  }
);

const updateCourse = errorUtilities.withServiceErrorHandling(
  async (id: string, courseData: any) => {
    const course = await courseRepositories.getCourse(id);
    if (!course) {
      throw errorUtilities.createError(`Course not found`, 404);
    }

    // Update the course with new data
    Object.assign(course, courseData);
    const updatedCourse = await courseRepositories.updateCourse(course);
    return updatedCourse;
  }
);

const deleteCourse = errorUtilities.withServiceErrorHandling(
  async (id: string) => {
    await courseRepositories.deleteCourse(id);

    return { message: "Course deleted successfully" };
  }
);

const getCourseWithLessonsService = errorUtilities.withServiceErrorHandling(
  async (languageId: string) => {
    const course = await courseRepositories.getCourseWithLanguageId(languageId);
    if (!course) {
      throw errorUtilities.createError(CourseResponses.COURSE_NOT_FOUND, StatusCodes.NotFound);
    }
    const lessons = await lessonRepositories.getLessonsOnly(course.id);
    return responseUtilities.handleServicesResponse(
      StatusCodes.OK,
      CourseResponses.PROCESS_SUCCESSFUL,
      { course, lessons }
    );
  })


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
      totalContents: lessons?.reduce((total: number, lesson: any) =>
        total + (lesson.contents?.length || 0), 0) || 0
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
          headLineTag: lesson.headlineTag
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
              createdAt: new Date()
            };

            const createdContent = await contentRepositories.createContent(newContentData);

            // Create content files
            if (contentData.contentFiles && contentData.contentFiles.length > 0) {
              for (const fileData of contentData.contentFiles) {
                const contentFileData = {
                  id: v4(),
                  contentId: newContentData.id,
                  contentType: fileData.contentType,
                  filePath: fileData.filePath,
                  description: fileData.description || null,
                  createdAt: new Date()
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
      newCourse
    );
  }
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
};