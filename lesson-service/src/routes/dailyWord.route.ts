import express from 'express';
import { wordForTheDayController } from '../controllers';

const router = express.Router();

router.post('/:languageId', wordForTheDayController.createDailyWordController);
router.get('/:languageId', wordForTheDayController.getWordOfTheDayController)
router.post('/many-words/:languageId', wordForTheDayController.createManyDailyWordsController)



export default router;