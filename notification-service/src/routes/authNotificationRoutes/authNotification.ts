import express from 'express';
import { userAuthNotifications } from '../../controllers/';
// import { joiValidators } from '../../validations';


const router = express.Router()


router.post('/welcome-otp', userAuthNotifications.sendWelcomeEmailWithNotificationController)
router.post('/resend-verification-otp', userAuthNotifications.sendResendOtpNotificationController)
router.post('/reset-password-link', userAuthNotifications.sendResetPasswordLinkController)
router.post('/password-reset-success', userAuthNotifications.sendPasswordResetConfirmationController)


export default router;