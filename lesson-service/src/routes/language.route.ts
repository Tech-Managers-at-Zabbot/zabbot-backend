import express from 'express';
import { 
    getLanguageController, 
    getLanguagesController, 
    createLanguageController, 
    changeLanguageStatusController, 
    deleteLanguageController, 
    updateLanguageController 
} from '../controllers/language.controller';
import { generalAuthFunction, rolePermit } from '../../../shared/middleware/authorization.middleware';

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
router.post('/', generalAuthFunction, rolePermit(["admin"]), createLanguageController);
router.put('/:id', generalAuthFunction, rolePermit(["admin"]), updateLanguageController);
router.delete('/:id', generalAuthFunction, rolePermit(["admin"]), deleteLanguageController);
router.patch('/:id/status', generalAuthFunction, rolePermit(["admin"]), changeLanguageStatusController);

// routes for language contents
// router.get('/contents', getLanguageContentsController);
// router.get('/contents/:id', getLanguageContentController);
// router.post('/contents', addLanguageContentController);
// router.put('/contents', updateLanguageContentController);
// router.delete('/contents', deleteLanguageContentController);

export default router;