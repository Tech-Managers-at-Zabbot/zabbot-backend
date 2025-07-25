import express from 'express';
import { dailyGoalController } from '../controllers';

const router = express.Router();

router.get('/daily-goal/:userId/:languageId', dailyGoalController.getUserDailyGoals)
router.post('/complete-daily-goal/:userId/:goalId', dailyGoalController.completeDailyGoalController)
router.get('/goals-count/:userId', dailyGoalController.getUserCompletedGoalsCount)

export default router;