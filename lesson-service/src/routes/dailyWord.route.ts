import express from 'express';
import { wordForTheDayController } from '../controllers';
import { generalAuthFunction, rolePermit } from '../../../shared/middleware/authorization.middleware';

const router = express.Router();

router.post('/:languageId', generalAuthFunction, rolePermit(["admin"]), wordForTheDayController.createDailyWordController);
router.get('/:languageId', generalAuthFunction, wordForTheDayController.getWordOfTheDayController)
router.post('/many-words/:languageId', generalAuthFunction, rolePermit(["admin"]), wordForTheDayController.createManyDailyWordsController)



export default router;