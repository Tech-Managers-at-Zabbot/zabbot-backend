"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const joi_validations_1 = __importDefault(require("../../validations/joi/joi.validations"));
const controllers_1 = require("../../controllers");
const express_1 = __importDefault(require("express"));
const passport_1 = __importDefault(require("passport"));
const config_1 = __importDefault(require("../../../../config/config"));
const router = express_1.default.Router();
router.post("/signup", joi_validations_1.default.inputValidator(joi_validations_1.default.userRegisterSchemaViaEmail), controllers_1.emailAuthControllers.userRegistrationController);
router.post("/verify-user", controllers_1.emailAuthControllers.verifyUserAccountController);
router.post("/resend-verification-otp", controllers_1.emailAuthControllers.resendVerificationOtpController);
router.post("/login", joi_validations_1.default.inputValidator(joi_validations_1.default.loginUserSchema), controllers_1.emailAuthControllers.userLoginController);
router.post("/reset-password-request", joi_validations_1.default.inputValidator(joi_validations_1.default.resendVerificationLinkSchema), controllers_1.emailAuthControllers.userPasswordResetRequestController);
router.post("/reset-password", joi_validations_1.default.inputValidator(joi_validations_1.default.resetPasswordSchema), controllers_1.emailAuthControllers.userResetPasswordController);
// Google Registration Route
router.get("/google/register", (request, response, next) => {
    const timezone = `${request.query.timezone}`;
    passport_1.default.authenticate("google-register", {
        scope: ["profile", "email"],
        session: false,
        passReqToCallback: true,
        state: timezone,
    })(request, response, next);
});
// Google Login Route
router.get("/google/login", (request, response, next) => {
    const timezone = `${request.query.timezone}`;
    passport_1.default.authenticate("google-login", {
        scope: ["profile", "email"],
        session: false,
        passReqToCallback: true,
        state: timezone,
    })(request, response, next);
});
// Google Registration Callback
router.get("/google/register/callback", (request, response, next) => {
    passport_1.default.authenticate("google-register", {
        session: false,
    })(request, response, (error) => {
        if (error) {
            return response.redirect(`${config_1.default.GOOGLE_AUTH_FAILURE_URL}?error=${error.message}`);
        }
        if (!request.user) {
            return response.redirect(`${config_1.default.GOOGLE_AUTH_FAILURE_URL}?error=registration_failed`);
        }
        return controllers_1.googleAuthControllers.googleAuthRegistrationCallbackController(request, response, next);
    });
});
// Google Login Callback
router.get("/google/login/callback", (request, response, next) => {
    passport_1.default.authenticate("google-login", {
        session: false,
    })(request, response, (error) => {
        if (error) {
            return response.redirect(`${config_1.default.GOOGLE_AUTH_FAILURE_URL}?error=${error.message}`);
        }
        if (!request.user) {
            return response.redirect(`${config_1.default.GOOGLE_AUTH_FAILURE_URL}?error=login_failed`);
        }
        return controllers_1.googleAuthControllers.googleAuthLoginCallbackController(request, response, next);
    });
});
router.get("/google/failure", controllers_1.googleAuthControllers.googleAuthFailure);
exports.default = router;
