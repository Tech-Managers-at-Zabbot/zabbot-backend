"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const controllers_1 = require("../controllers");
const authorization_middleware_1 = require("../../../shared/middleware/authorization.middleware");
const validations_1 = require("../validations");
const router = express_1.default.Router();
router.post('/create-quiz', validations_1.JoiValidators.inputValidator(validations_1.JoiValidators.createQuizSchema), authorization_middleware_1.generalAuthFunction, (0, authorization_middleware_1.rolePermit)(["admin"]), controllers_1.quizController.addQuizController);
router.get('/:courseId', authorization_middleware_1.generalAuthFunction, controllers_1.quizController.getCourseQuizzesController);
exports.default = router;
