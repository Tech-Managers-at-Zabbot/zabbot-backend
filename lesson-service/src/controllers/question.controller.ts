import {Request, Response} from 'express';
import { errorUtilities, responseUtilities } from '../../../shared/utilities';
import questionService from '../services/lessonServices/question.service';


// Controller to get all questions
export const getQuestionsController = errorUtilities.withControllerErrorHandling(
  async (req: Request, res: Response) => {
    const lessonId = req.query;
    const questions = await questionService.getQuestions({lessonId});

    return responseUtilities.responseHandler(res, questions.message, questions.statusCode, questions.data);
  }
);

// Controller to get a single question
export const getQuestionController = errorUtilities.withControllerErrorHandling(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const question = await questionService.getQuestion(id);

    return responseUtilities.responseHandler(res, question.message, question.statusCode, question.data);
  }
);

// Controller to add a new question
export const createQuestionController = errorUtilities.withControllerErrorHandling(
  async (req: Request, res: Response) => {
    const payload = req.body;
    const question = await questionService.addQuestion(payload);

    return responseUtilities.responseHandler(res, question.message, question.statusCode, question.data);
  }
);

// Controller to update an existing question
export const updateQuestionController = errorUtilities.withControllerErrorHandling(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const payload = req.body;
    const question = await questionService.updateQuestion(id, payload);

    return responseUtilities.responseHandler(res, question.message, question.statusCode, question.data);
  }
);

// Controller to delete a question
export const deleteQuestionController = errorUtilities.withControllerErrorHandling(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const deletedQuestion = await questionService.deleteQuestion(id);

    return responseUtilities.responseHandler(res, deletedQuestion.message, deletedQuestion.statusCode, deletedQuestion.data);
  }
);

export const mapLessonToQuestionsController = errorUtilities.withControllerErrorHandling (
  async (req: Request, res: Response) => {
    const { payload } = req.body;
    const map = await questionService.mapQuestionToLesson(payload);

    return responseUtilities.responseHandler(res, map.message, map.statusCode, map.data);
  }
);

export const deleteLessonToQuestionController = errorUtilities.withControllerErrorHandling (
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const deleteMap = await questionService.deleteQuestionToLessonMap(id);

    return responseUtilities.responseHandler(res, deleteMap.message, deleteMap.statusCode, deleteMap.data);
  }
);

export const mapContentToQuestionsController = errorUtilities.withControllerErrorHandling (
  async (req: Request, res: Response) => {
    const { payload } = req.body;
    const map = await questionService.mapQuestionToContent(payload);

    return responseUtilities.responseHandler(res, map.message, map.statusCode, map.data);
  }
);

export const deleteContentToQuestionController = errorUtilities.withControllerErrorHandling (
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const deleteMap = await questionService.deleteQuestionToContentMap(id);

    return responseUtilities.responseHandler(res, deleteMap.message, deleteMap.statusCode, deleteMap.data);
  }
);
