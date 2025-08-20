import joiValidations from '../../validations/joi/joi.validations';
import { emailAuthControllers, googleAuthControllers } from '../../controllers';
import express, {Request, Response, NextFunction} from 'express';
import passport from 'passport';
import config from '../../../../config/config';


const router = express.Router()


router.post('/signup', joiValidations.inputValidator(joiValidations.userRegisterSchemaViaEmail), emailAuthControllers.userRegistrationController)
router.post('/verify-user', emailAuthControllers.verifyUserAccountController)
router.post('/resend-verification-otp', emailAuthControllers.resendVerificationOtpController)
router.post('/login', joiValidations.inputValidator(joiValidations.loginUserSchema), emailAuthControllers.userLoginController)
router.post('/reset-password-request', joiValidations.inputValidator(joiValidations.resendVerificationLinkSchema), emailAuthControllers.userPasswordResetRequestController)
router.post('/reset-password', joiValidations.inputValidator(joiValidations.resetPasswordSchema), emailAuthControllers.userResetPasswordController)

// Google Registration Route
router.get(
  '/google/register',
  (request: Request, response: Response, next: NextFunction) => {
    passport.authenticate('google-register', {
      scope: ['profile', 'email'],
      session: false,
      passReqToCallback: true
    })(request, response, next);
  }
);

// Google Login Route
router.get(
  '/google/login',
  (request: Request, response: Response, next: NextFunction) => {
    passport.authenticate('google-login', {
      scope: ['profile', 'email'],
      session: false,
      passReqToCallback: true
    })(request, response, next);
  }
);

// Google Registration Callback
router.get(
  '/google/register/callback',
  (request: Request, response: Response, next: NextFunction) => {
    passport.authenticate('google-register', {
      session: false,
    })(request, response, (error: any) => {
      if (error) {
        return response.redirect(`${config.GOOGLE_AUTH_FAILURE_URL}?error=${error.message}`);
      }
      
      if (!request.user) {
        return response.redirect(`${config.GOOGLE_AUTH_FAILURE_URL}?error=registration_failed`);
      }
      
      return googleAuthControllers.googleAuthRegistrationCallbackController(request, response, next);
    });
  }
);

// Google Login Callback
router.get(
  '/google/login/callback',
  (request: Request, response: Response, next: NextFunction) => {
    passport.authenticate('google-login', {
      session: false,
    })(request, response, (error: any) => {
      if (error) {
        return response.redirect(`${config.GOOGLE_AUTH_FAILURE_URL}?error=${error.message}`);
      }
      
      if (!request.user) {
        return response.redirect(`${config.GOOGLE_AUTH_FAILURE_URL}?error=login_failed`);
      }
      
      return googleAuthControllers.googleAuthLoginCallbackController(request, response, next);
    });
  }
);

router.get('/google/failure', googleAuthControllers.googleAuthFailure);

export default router