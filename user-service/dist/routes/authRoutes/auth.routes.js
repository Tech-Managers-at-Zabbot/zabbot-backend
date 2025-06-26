"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const joi_validations_1 = __importDefault(require("../../validations/joi/joi.validations"));
const controllers_1 = require("../../controllers");
const express_1 = __importDefault(require("express"));
const passport_1 = __importDefault(require("passport"));
const router = express_1.default.Router();
router.post('/signup', joi_validations_1.default.inputValidator(joi_validations_1.default.userRegisterSchemaViaEmail), controllers_1.emailAuthControllers.userRegistrationController);
router.post('/verify-user', controllers_1.emailAuthControllers.verifyUserAccountController);
router.post('/resend-verification-otp', controllers_1.emailAuthControllers.resendVerificationOtpController);
router.post('/login', joi_validations_1.default.inputValidator(joi_validations_1.default.loginUserSchema), controllers_1.emailAuthControllers.userLoginController);
router.post('/reset-password-request', joi_validations_1.default.inputValidator(joi_validations_1.default.resendVerificationLinkSchema), controllers_1.emailAuthControllers.userPasswordResetRequestController);
router.post('/reset-password', joi_validations_1.default.inputValidator(joi_validations_1.default.resetPasswordSchema), controllers_1.emailAuthControllers.userResetPasswordController);
router.get('/google', passport_1.default.authenticate('google', {
    scope: ['profile', 'email'],
    session: false,
}));
// router.get(
//   '/google/callback',
//   passport.authenticate('google', {
//     session: false,
//     failureRedirect: '/api/v1/users/auth/google/failure',
//   }),
//   googleAuthControllers.googleAuthCallbackController
// );
router.get('/google/callback', (req, res, next) => {
    passport_1.default.authenticate('google', {
        session: false,
    })(req, res, (err) => {
        if (err) {
            // Redirect to failure with error message
            return res.redirect(`/api/v1/users/auth/google/failure?error=${err.message}`);
        }
        if (!req.user) {
            return res.redirect(`/api/v1/users/auth/google/failure?error=authentication_failed`);
        }
        // Success - call your controller
        return controllers_1.googleAuthControllers.googleAuthCallbackController(req, res, next);
    });
});
router.get('/google/failure', controllers_1.googleAuthControllers.googleAuthFailure);
exports.default = router;
