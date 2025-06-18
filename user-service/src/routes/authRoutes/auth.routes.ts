import joiValidations from '../../validations/joi/joi.validations';
import { authControllers } from '../../controllers';
import express from 'express';

const router = express.Router()


router.post('/signup', joiValidations.inputValidator(joiValidations.userRegisterSchemaViaEmail), authControllers.userRegistrationController)
router.post('/verify-user', authControllers.verifyUserAccountController)
router.post('/resend-verification-otp', authControllers.resendVerificationOtpController)
router.post('/login', joiValidations.inputValidator(joiValidations.loginUserSchema), authControllers.userLoginController)
router.post('/reset-password-request', joiValidations.inputValidator(joiValidations.resendVerificationLinkSchema), authControllers.userPasswordResetRequestController)
router.post('/reset-password', joiValidations.inputValidator(joiValidations.resetPasswordSchema), authControllers.userResetPasswordController)

export default router