import express from 'express';
import { 
    getLanguageController, 
    getLanguagesController, 
    createLanguageController, 
    changeLanguageStatusController, 
    deleteLanguageController, 
    updateLanguageController 
} from '../controllers/language.controller';

// import {
//     getLanguageContentController,
//     getLanguageContentsController,
//     addLanguageContentController,
//     updateLanguageContentController,
//     deleteLanguageContentController
// } from '../controllers/language.controller';

const router = express.Router();

// routes for language
router.get('/', getLanguagesController);
router.get('/:id', getLanguageController);
router.post('/', createLanguageController);
router.put('/:id', updateLanguageController);
router.delete('/:id', deleteLanguageController);
router.patch('/:id/status', changeLanguageStatusController);

// routes for language contents
// router.get('/contents', getLanguageContentsController);
// router.get('/contents/:id', getLanguageContentController);
// router.post('/contents', addLanguageContentController);
// router.put('/contents', updateLanguageContentController);
// router.delete('/contents', deleteLanguageContentController);

export default router;