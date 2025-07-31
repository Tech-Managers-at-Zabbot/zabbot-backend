import express from 'express';
import { getLessonsController, getLessonController, createLessonController, updateLessonController,} from '../controllers/lesson.controller';
import { generalAuthFunction, rolePermit } from '../../../shared/middleware/authorization.middleware';

const router = express.Router();

router.get('/', getLessonsController);
router.get('/:id', getLessonController);
router.post('/', generalAuthFunction, rolePermit(["admin"]), createLessonController);
router.put('/:id', generalAuthFunction, rolePermit(["admin"]), updateLessonController);

export default router;