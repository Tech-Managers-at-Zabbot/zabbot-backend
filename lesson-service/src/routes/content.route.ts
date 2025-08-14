import express from 'express';
import { 
    getContentsController, 
    getLessonContentsController, 
    getContentController, 
    addContentController, 
    updateContentController,
    getLanguageContentsController, 
    addContentFileController
} from '../controllers/content.controller';

const router = express.Router();

router.get('/', getContentsController);
router.get('/lesson/:lessonId', getLessonContentsController);
router.get('/:id', getContentController);
router.post('/', addContentController);
router.put('/:id', updateContentController);
router.get('/language-contents/:languageId', getLanguageContentsController);
router.post('/add-file', addContentFileController);

export default router;