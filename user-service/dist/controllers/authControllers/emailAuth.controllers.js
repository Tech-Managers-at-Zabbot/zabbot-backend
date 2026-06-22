"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const services_1 = require("../../services");
const utilities_1 = require("../../../../shared/utilities");
const statusCodes_responses_1 = require("../../../../shared/statusCodes/statusCodes.responses");
const otp_responses_1 = require("../../responses/otpResponses/otp.responses");
/**
 * @description Controller for user registration
 * @param request - Express Request object
 * @param response - Express Response object
 * @returns Response with user registration status
 */
// user-service registration controller
const userRegistrationController = utilities_1.errorUtilities.withControllerErrorHandling(async (request, response) => {
    const payloadDetails = request.body;
    const registerUser = await services_1.emailAuthServices.registerUserService(payloadDetails);
    return utilities_1.responseUtilities.responseHandler(response, registerUser.message, registerUser.statusCode, registerUser.data);
});
const verifyUserAccountController = utilities_1.errorUtilities.withControllerErrorHandling(async (request, response) => {
    const { email, otp } = request.body;
    if (!otp) {
        throw utilities_1.errorUtilities.createError(otp_responses_1.OtpResponses.ENTER_OTP, statusCodes_responses_1.StatusCodes.BadRequest);
    }
    const verifiedUser = await services_1.emailAuthServices.verifyUserAccountService(email, otp);
    return utilities_1.responseUtilities.responseHandler(response, verifiedUser.message, verifiedUser.statusCode, verifiedUser.data);
});
const resendVerificationOtpController = utilities_1.errorUtilities.withControllerErrorHandling(async (request, response) => {
    const { email } = request.body;
    const resendLink = await services_1.emailAuthServices.resendVerificationOtpService(email);
    return utilities_1.responseUtilities.responseHandler(response, resendLink.message, resendLink.statusCode, resendLink.data);
});
const userLoginController = utilities_1.errorUtilities.withControllerErrorHandling(async (request, response) => {
    const payloadDetails = request.body;
    const userLogin = await services_1.emailAuthServices.loginUserService(payloadDetails);
    return utilities_1.responseUtilities.responseHandler(response, userLogin.message, userLogin.statusCode, userLogin.data);
});
const userPasswordResetRequestController = utilities_1.errorUtilities.withControllerErrorHandling(async (request, response) => {
    const { email } = request.body;
    const requestPasswordReset = await services_1.emailAuthServices.passwordResetRequestService(email);
    return utilities_1.responseUtilities.responseHandler(response, requestPasswordReset.message, requestPasswordReset.statusCode, requestPasswordReset.data);
});
const userResetPasswordController = utilities_1.errorUtilities.withControllerErrorHandling(async (request, response) => {
    const { token, newPassword, confirmNewPassword } = request.body;
    const resetPassword = await services_1.emailAuthServices.resetPasswordService({
        token,
        newPassword,
        confirmNewPassword,
    });
    return utilities_1.responseUtilities.responseHandler(response, resetPassword.message, resetPassword.statusCode, resetPassword.data);
});
const changeUserPasswordController = utilities_1.errorUtilities.withControllerErrorHandling(async (request, response) => {
    const { userId } = request.user;
    const { currentPassword, newPassword, confirmNewPassword } = request.body;
    const changePassword = await services_1.emailAuthServices.changePasswordService(userId, currentPassword, newPassword, confirmNewPassword);
    return utilities_1.responseUtilities.responseHandler(response, changePassword.message, changePassword.statusCode, changePassword.data);
});
const updateUserNamesController = utilities_1.errorUtilities.withControllerErrorHandling(async (request, response) => {
    const { userId } = request.user;
    const updatedData = await services_1.emailAuthServices.editUserNamesService(request.body, userId);
    return utilities_1.responseUtilities.responseHandler(response, updatedData.message, updatedData.statusCode, updatedData.data);
});
const getSingleUserDetailsController = utilities_1.errorUtilities.withControllerErrorHandling(async (request, response) => {
    const { userId } = request.user;
    console.log("11", userId);
    const singleUserDetails = await services_1.emailAuthServices.getSingleUserDetailsService(userId);
    return utilities_1.responseUtilities.responseHandler(response, singleUserDetails.message, singleUserDetails.statusCode, singleUserDetails.data);
});
exports.default = {
    userRegistrationController,
    verifyUserAccountController,
    resendVerificationOtpController,
    userLoginController,
    userPasswordResetRequestController,
    userResetPasswordController,
    changeUserPasswordController,
    updateUserNamesController,
    getSingleUserDetailsController,
};
