import express from 'express';
import { dailyGoalController } from '../controllers';
import { generalAuthFunction } from '../../../shared/middleware/authorization.middleware';

const router = express.Router();

router.get('/daily-goal/:languageId', generalAuthFunction, dailyGoalController.getUserDailyGoals)
router.post('/complete-daily-goal/:userId/:goalId', generalAuthFunction, dailyGoalController.completeDailyGoalController)
router.get('/goals-count/:userId', generalAuthFunction, dailyGoalController.getUserCompletedGoalsCount)

export default router;