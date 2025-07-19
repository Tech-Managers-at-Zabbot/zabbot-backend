import express from 'express';
import { getLessonsController, getLessonController, createLessonController, updateLessonController,} from '../controllers/lesson.controller';

const router = express.Router();

router.get('/lessons', getLessonsController);
router.get('/lessons/:id', getLessonController);
router.post('/lessons', createLessonController);
router.put('/lessons/:id', updateLessonController);

export default router;