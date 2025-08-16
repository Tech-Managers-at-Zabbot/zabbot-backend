import express from 'express';
import { getLessonsController, getLessonController, createLessonController, updateLessonController, getLessonWithContentsController, getLanguageLessonsController, getCourseLessonsController,} from '../controllers/lesson.controller';
import { generalAuthFunction, rolePermit } from '../../../shared/middleware/authorization.middleware';

const router = express.Router();

router.get('/', getLessonsController);
router.get('/:id', getLessonController);
router.post('/', generalAuthFunction, rolePermit(["admin"]), createLessonController);
router.put('/:id', generalAuthFunction, rolePermit(["admin"]), updateLessonController);
router.get('/lesson-with-contents/:lessonId', generalAuthFunction, getLessonWithContentsController)
router.get('/language-lessons/:languageId', generalAuthFunction, getLanguageLessonsController);
router.get('/course-lessons/:courseId', generalAuthFunction, getCourseLessonsController);


export default router;