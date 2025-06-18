"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const services_1 = require("../services");
const utilities_1 = require("../../../shared/utilities");
const sendWelcomeEmailWithNotificationController = utilities_1.errorUtilities.withControllerErrorHandling(async (request, response) => {
    const { email, firstName, otp } = request.body;
    const sendWelcomeEmail = await services_1.sendgridMailServices.sendWelcomeEmailWithOtpService(email, firstName, otp);
    return utilities_1.responseUtilities.responseHandler(response, sendWelcomeEmail.message, sendWelcomeEmail.statusCode, sendWelcomeEmail.data);
});
const sendResendOtpNotificationController = utilities_1.errorUtilities.withControllerErrorHandling(async (request, response) => {
    const { email, firstName, otp } = request.body;
    console.log(`Resend OTP Request: ${JSON.stringify(request.body)}`);
    const sendOtp = await services_1.sendgridMailServices.sendgridResendOtpService(email, firstName, otp);
    console.log(`Resend OTP Response: ${JSON.stringify(sendOtp)}`);
    return utilities_1.responseUtilities.responseHandler(response, sendOtp.message, sendOtp.statusCode, sendOtp.data);
});
const sendResetPasswordLinkController = utilities_1.errorUtilities.withControllerErrorHandling(async (request, response) => {
    const { email, resetUrl, firstName } = request.body;
    console.log(`Send Reset Password Link: ${JSON.stringify(request.body)}`);
    const sendResetPasswordLink = await services_1.sendgridMailServices.sendgridSendPasswordResetLinkService(email, resetUrl, firstName);
    console.log(`Send Reset Password Link: ${JSON.stringify(sendResetPasswordLink)}`);
    return utilities_1.responseUtilities.responseHandler(response, sendResetPasswordLink.message, sendResetPasswordLink.statusCode, sendResetPasswordLink.data);
});
const sendPasswordResetConfirmationController = utilities_1.errorUtilities.withControllerErrorHandling(async (request, response) => {
    const { email, firstName } = request.body;
    console.log(`Send Reset Password Link: ${JSON.stringify(request.body)}`);
    const sendPasswordResetConfirmation = await services_1.sendgridMailServices.sendgridSendPasswordResetConfirmationService(email, firstName);
    console.log(`Send Reset Password Link: ${JSON.stringify(sendPasswordResetConfirmation)}`);
    return utilities_1.responseUtilities.responseHandler(response, sendPasswordResetConfirmation.message, sendPasswordResetConfirmation.statusCode, sendPasswordResetConfirmation.data);
});
exports.default = {
    sendWelcomeEmailWithNotificationController,
    sendResendOtpNotificationController,
    sendResetPasswordLinkController,
    sendPasswordResetConfirmationController
};
