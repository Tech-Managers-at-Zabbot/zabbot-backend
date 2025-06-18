"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const joi_validations_1 = __importDefault(require("../../validations/joi/joi.validations"));
const controllers_1 = require("../../controllers");
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
router.post('/signup', joi_validations_1.default.inputValidator(joi_validations_1.default.userRegisterSchemaViaEmail), controllers_1.authControllers.userRegistrationController);
router.post('/verify-user', controllers_1.authControllers.verifyUserAccountController);
router.post('/resend-verification-otp', controllers_1.authControllers.resendVerificationOtpController);
router.post('/login', joi_validations_1.default.inputValidator(joi_validations_1.default.loginUserSchema), controllers_1.authControllers.userLoginController);
router.post('/reset-password-request', joi_validations_1.default.inputValidator(joi_validations_1.default.resendVerificationLinkSchema), controllers_1.authControllers.userPasswordResetRequestController);
router.post('/reset-password', joi_validations_1.default.inputValidator(joi_validations_1.default.resetPasswordSchema), controllers_1.authControllers.userResetPasswordController);
exports.default = router;
