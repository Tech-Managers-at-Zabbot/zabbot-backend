import express, { Request, Response } from 'express';
import { mailChimpServices, sendgridMailServices } from '../services'
import { errorUtilities, helpersUtilities, responseUtilities } from '../../../shared/utilities';


const sendWelcomeEmailWithNotificationController = errorUtilities.withControllerErrorHandling(async (request: Request, response: Response) => {

  const { email, firstName, otp } = request.body;

  const sendWelcomeEmail: any = await sendgridMailServices.sendWelcomeEmailWithOtpService(email, firstName, otp);

  return responseUtilities.responseHandler(
    response,
    sendWelcomeEmail.message,
    sendWelcomeEmail.statusCode,
    sendWelcomeEmail.data
  );
})


const sendResendOtpNotificationController = errorUtilities.withControllerErrorHandling(async (request: Request, response: Response) => {

  const { email, firstName, otp } = request.body;

  const sendOtp: any = await sendgridMailServices.sendgridResendOtpService(email, firstName, otp);
  
  return responseUtilities.responseHandler(
    response,
    sendOtp.message,
    sendOtp.statusCode,
    sendOtp.data
  );
})

const sendResetPasswordLinkController = errorUtilities.withControllerErrorHandling(async (request: Request, response: Response) => {

  const { email, resetUrl, firstName } = request.body;

  const sendResetPasswordLink: any = await sendgridMailServices.sendgridSendPasswordResetLinkService(email, resetUrl, firstName);
  
  return responseUtilities.responseHandler(
    response,
    sendResetPasswordLink.message,
    sendResetPasswordLink.statusCode,
    sendResetPasswordLink.data
  );
})


const sendPasswordResetConfirmationController = errorUtilities.withControllerErrorHandling(async (request: Request, response: Response) => {

  const { email, firstName } = request.body;

  const sendPasswordResetConfirmation: any = await sendgridMailServices.sendgridSendPasswordResetConfirmationService(email, firstName);
  
  return responseUtilities.responseHandler(
    response,
    sendPasswordResetConfirmation.message,
    sendPasswordResetConfirmation.statusCode,
    sendPasswordResetConfirmation.data
  );
})


export default {
    sendWelcomeEmailWithNotificationController,
    sendResendOtpNotificationController,
    sendResetPasswordLinkController,
    sendPasswordResetConfirmationController
}