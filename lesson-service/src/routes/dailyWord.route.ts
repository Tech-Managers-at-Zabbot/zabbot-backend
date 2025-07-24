import express from 'express';
import { wordForTheDayController } from '../controllers';

const router = express.Router();

router.post('/', wordForTheDayController.createDailyWordController);
router.get('/daily-word/:languageId', wordForTheDayController.getWordOfTheDayController)


export default router;