import express from 'express';
import { getLessons, getLesson, createLesson, updateLesson } from '../controllers/lesson.controller';

const router = express.Router();

router.get('/lessons', getLessons);
router.get('/lessons/:id', getLesson);
router.post('/lessons', createLesson);
router.put('/lessons/:id', updateLesson);

export default router;