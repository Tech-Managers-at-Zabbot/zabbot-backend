"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const controllers_1 = require("../controllers");
const router = express_1.default.Router();
router.get('/daily-goal/:userId/:languageId', controllers_1.dailyGoalController.getUserDailyGoals);
router.post('/complete-daily-goal/:userId/:goalId', controllers_1.dailyGoalController.completeDailyGoalController);
router.get('/goals-count/:userId', controllers_1.dailyGoalController.getUserCompletedGoalsCount);
exports.default = router;
