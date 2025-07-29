"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const validations_1 = require("../../validations");
// import { generalAuthFunction } from '../../middlewares/authorization';
// import { cloudinaryUtilities } from '../../utilities';
const controllers_1 = require("../../controllers");
const router = express_1.default.Router();
router.post('/create-phrase', validations_1.joiValidators.inputValidator(validations_1.joiValidators.createPhraseSchema), controllers_1.adminControllers.adminCreatePhrase);
router.put('/update-phrase/:phraseId', controllers_1.adminControllers.adminUpdatesPhrase);
router.delete('/delete-phrase/:phraseId', controllers_1.adminControllers.adminDeletesPhrase);
router.post('/add-many-phrases', controllers_1.adminControllers.adminCreatesManyPhrases);
router.post('/cleanup-cloudinary-files', controllers_1.adminControllers.adminDeletesCloudinaryLeftOverRecordings);
router.get('/recordings-for-zabbot', controllers_1.adminControllers.adminGetsPhraseWithRecordingsForZabbot);
router.get('/many-recordings', controllers_1.adminControllers.adminGetsPhraseWithRecordingsForZabbotBatch);
exports.default = router;
