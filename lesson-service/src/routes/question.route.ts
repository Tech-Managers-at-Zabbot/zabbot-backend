import express from 'express';

import { 
    getQuestionsController,
    getQuestionController, 
    createQuestionController,
    updateQuestionController,
    deleteQuestionController,
    mapLessonToQuestionsController,
    deleteLessonToQuestionController,
    mapContentToQuestionsController,
    deleteContentToQuestionController
} from '../controllers/question.controller';

const router = express.Router();

// routes for questions
router.get('/', getQuestionsController);
router.get('/:id', getQuestionController);
router.post('/', createQuestionController);
router.put('/:id', updateQuestionController);
router.delete('/:id', deleteQuestionController);
router.post('/:id/lessons/:lessonId', mapLessonToQuestionsController);
router.delete('/:id/lessons/:lessonId', deleteLessonToQuestionController);
router.post('/:id/contents/:contentId', mapContentToQuestionsController);
router.delete('/:id/contents/:contentId', deleteContentToQuestionController);

export default router;