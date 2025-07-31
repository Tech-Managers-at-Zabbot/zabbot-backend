"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.dailyGoalController = exports.wordForTheDayController = void 0;
// import languageController from "./language.controller";
// import lessonController from "./lesson.controller";
const wordForTheDay_controller_1 = __importDefault(require("./wordForTheDay.controller"));
exports.wordForTheDayController = wordForTheDay_controller_1.default;
const dailyGoal_controller_1 = __importDefault(require("./dailyGoal.controller"));
exports.dailyGoalController = dailyGoal_controller_1.default;
