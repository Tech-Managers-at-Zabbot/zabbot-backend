"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const controllers_1 = require("../../controllers/");
// import { joiValidators } from '../../validations';
const router = express_1.default.Router();
router.post('/welcome-otp', controllers_1.userAuthNotifications.sendWelcomeEmailWithNotificationController);
router.post('/resend-verification-otp', controllers_1.userAuthNotifications.sendResendOtpNotificationController);
router.post('/reset-password-link', controllers_1.userAuthNotifications.sendResetPasswordLinkController);
router.post('/password-reset-success', controllers_1.userAuthNotifications.sendPasswordResetConfirmationController);
exports.default = router;
