"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const language_controller_1 = require("../controllers/language.controller");
// import {
//     getLanguageContentController,
//     getLanguageContentsController,
//     addLanguageContentController,
//     updateLanguageContentController,
//     deleteLanguageContentController
// } from '../controllers/language.controller';
const router = express_1.default.Router();
// routes for language
router.get('/', language_controller_1.getLanguagesController);
router.get('/:id', language_controller_1.getLanguageController);
router.post('/', language_controller_1.createLanguageController);
router.put('/:id', language_controller_1.updateLanguageController);
router.delete('/:id', language_controller_1.deleteLanguageController);
router.patch('/:id/status', language_controller_1.changeLanguageStatusController);
// routes for language contents
// router.get('/contents', getLanguageContentsController);
// router.get('/contents/:id', getLanguageContentController);
// router.post('/contents', addLanguageContentController);
// router.put('/contents', updateLanguageContentController);
// router.delete('/contents', deleteLanguageContentController);
exports.default = router;
