"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const validations_1 = require("../../validations");
const authorization_1 = require("../../middlewares/authorization");
const controllers_1 = require("../../controllers");
const cloudinary_1 = __importDefault(require("../../utilities/cloudinary"));
const router = express_1.default.Router();
router.post('/register', validations_1.joiValidators.inputValidator(validations_1.joiValidators.userRegisterSchemaViaEmail), controllers_1.authController.userRegister);
router.post('/login', validations_1.joiValidators.inputValidator(validations_1.joiValidators.loginUserSchemaViaEmail), controllers_1.authController.userLoginWithEmail);
router.post('/save-recording', authorization_1.generalAuthFunction, cloudinary_1.default, controllers_1.userController.userAddsRecording);
router.get('/all-my-recordings', authorization_1.generalAuthFunction, controllers_1.userController.userGetsAllTheirRecordings);
router.get('/unrecorded-phrases', authorization_1.generalAuthFunction, controllers_1.userController.userGetsUnrecordedPhrases);
router.delete('/delete-my-recording/:recordingId', authorization_1.generalAuthFunction, controllers_1.userController.userDeletesSingleRecording);
exports.default = router;
