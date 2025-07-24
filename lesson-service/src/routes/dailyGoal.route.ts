import express from 'express';
import { dailyGoalController } from '../controllers';

const router = express.Router();

router.get('/daily-goal/:userId/:languageId', dailyGoalController.getUserDailyGoals)


export default router;