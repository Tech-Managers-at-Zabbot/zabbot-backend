import express from 'express';
import { 
    getLanguageController, 
    getLanguagesController, 
    createLanguageController, 
    changeLanguageStatusController, 
    deleteLanguageController, 
    updateLanguageController 
} from '../controllers/language.controller';

const router = express.Router();

router.get('/', getLanguagesController);
router.get('/:id', getLanguageController);
router.post('/', createLanguageController);
router.put('/:id', updateLanguageController);
router.delete('/:id', deleteLanguageController);
router.patch('/:id/status', changeLanguageStatusController);

export default router;