"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const controllers_1 = require("../controllers");
const authorization_middleware_1 = require("../../../shared/middleware/authorization.middleware");
const router = express_1.default.Router();
router.post('/:languageId', authorization_middleware_1.generalAuthFunction, (0, authorization_middleware_1.rolePermit)(["admin"]), controllers_1.wordForTheDayController.createDailyWordController);
router.get('/:languageId', authorization_middleware_1.generalAuthFunction, controllers_1.wordForTheDayController.getWordOfTheDayController);
router.post('/many-words/:languageId', authorization_middleware_1.generalAuthFunction, (0, authorization_middleware_1.rolePermit)(["admin"]), controllers_1.wordForTheDayController.createManyDailyWordsController);
exports.default = router;
