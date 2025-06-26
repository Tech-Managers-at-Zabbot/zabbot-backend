import joiValidations from '../../validations/joi/joi.validations';
import { emailAuthControllers, googleAuthControllers } from '../../controllers';
import express, {Request, Response, NextFunction} from 'express';
import passport from 'passport';

const router = express.Router()


router.post('/signup', joiValidations.inputValidator(joiValidations.userRegisterSchemaViaEmail), emailAuthControllers.userRegistrationController)
router.post('/verify-user', emailAuthControllers.verifyUserAccountController)
router.post('/resend-verification-otp', emailAuthControllers.resendVerificationOtpController)
router.post('/login', joiValidations.inputValidator(joiValidations.loginUserSchema), emailAuthControllers.userLoginController)
router.post('/reset-password-request', joiValidations.inputValidator(joiValidations.resendVerificationLinkSchema), emailAuthControllers.userPasswordResetRequestController)
router.post('/reset-password', joiValidations.inputValidator(joiValidations.resetPasswordSchema), emailAuthControllers.userResetPasswordController)

router.get(
  '/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    session: false,
  })
);

// router.get(
//   '/google/callback',
//   passport.authenticate('google', {
//     session: false,
//     failureRedirect: '/api/v1/users/auth/google/failure',
//   }),
//   googleAuthControllers.googleAuthCallbackController
// );

router.get(
  '/google/callback',
  (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate('google', {
      session: false,
    })(req, res, (err: any) => {
      if (err) {
        // Redirect to failure with error message
        return res.redirect(`/api/v1/users/auth/google/failure?error=${err.message}`);
      }
      
      if (!req.user) {
        return res.redirect(`/api/v1/users/auth/google/failure?error=authentication_failed`);
      }
      
      // Success - call your controller
      return googleAuthControllers.googleAuthCallbackController(req, res, next);
    });
  }
);

router.get('/google/failure', googleAuthControllers.googleAuthFailure);


export default router