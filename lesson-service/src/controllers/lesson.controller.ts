import { Request, Response } from 'express';
import lessonService from '../services/lessonServices/lesson.service'
import { errorUtilities, responseUtilities } from '../../../shared/utilities';

// Controller to get all lessons
export const getLessonsController = errorUtilities.withControllerErrorHandling(
  async (req: Request, res: Response) => {
    const payload = req.body;
    const lessons = await lessonService.getLessons(payload);
    return responseUtilities.responseHandler(res, lessons.message, lessons.statusCode, lessons.data);
  }
);

// Controller to get a single lesson
export const getLessonController = errorUtilities.withControllerErrorHandling(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const lesson = await lessonService.getLesson(id);
    return responseUtilities.responseHandler(res, lesson.message, lesson.statusCode, lesson.data);
  }
);

export const getLanguageLessonsController = errorUtilities.withControllerErrorHandling(
  async (req: Request, res: Response) => {
    const { languageId } = req.params;
    const lesson = await lessonService.getLessonsForLanguage(languageId);
    return responseUtilities.responseHandler(res, lesson.message, lesson.statusCode, lesson.data);
  }
);

export const getCourseLessonsController = errorUtilities.withControllerErrorHandling(
  async (req: Request, res: Response) => {
    const { courseId } = req.params;

    console.log('id', courseId)
    const lessons = await lessonService.getLessonsForCourse(courseId);
    return responseUtilities.responseHandler(res, lessons.message, lessons.statusCode, lessons.data);
  }
);

// Controller to create a new lesson
export const createLessonController = errorUtilities.withControllerErrorHandling(
  async (req: Request, res: Response) => {
    const payload = req.body;
    const lesson = await lessonService.createLesson(payload);
    return responseUtilities.responseHandler(res, lesson.message, lesson.statusCode, lesson.data);
  }
);

// Controller to update an existing lesson
export const updateLessonController = errorUtilities.withControllerErrorHandling(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const payload = req.body;
    const lesson = await lessonService.updateLesson(id, payload);
    return responseUtilities.responseHandler(res, lesson.message, lesson.statusCode, lesson.data);
  }
);

export const getLessonWithContentsController = errorUtilities.withControllerErrorHandling(
  async (req: Request, res: Response) => {
    const { lessonId } = req.params;
    const lesson = await lessonService.getLessonWithContents(lessonId);
    return responseUtilities.responseHandler(res, lesson.message, lesson.statusCode, lesson.data);
  })