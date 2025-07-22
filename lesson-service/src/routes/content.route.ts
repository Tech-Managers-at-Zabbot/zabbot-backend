import express from 'express';
import { 
    getContentsController, 
    getLessonContentsController, 
    getContentController, 
    addContentController, 
    updateContentController 
} from '../controllers/content.controller';

const router = express.Router();

router.get('/', getContentsController);
router.get('/lesson/:lessonId', getLessonContentsController);
router.get('/:id', getContentController);
router.post('/', addContentController);
router.put('/:id', updateContentController);

export default router;