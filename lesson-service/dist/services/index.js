"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.dailyGoalsServices = exports.dailyWordsServices = void 0;
const dailyWords_services_1 = __importDefault(require("./wordForTheDayServices/dailyWords.services"));
exports.dailyWordsServices = dailyWords_services_1.default;
const dailyGoals_services_1 = __importDefault(require("./dailyGoalServices/dailyGoals.services"));
exports.dailyGoalsServices = dailyGoals_services_1.default;
