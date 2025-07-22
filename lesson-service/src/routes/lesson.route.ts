import express from 'express';
import { getLessonsController, getLessonController, createLessonController, updateLessonController,} from '../controllers/lesson.controller';

const router = express.Router();

router.get('/', getLessonsController);
router.get('/:id', getLessonController);
router.post('/', createLessonController);
router.put('/:id', updateLessonController);

export default router;