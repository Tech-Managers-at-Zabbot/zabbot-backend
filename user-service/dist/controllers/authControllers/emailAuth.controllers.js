"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const services_1 = require("../../services");
const utilities_1 = require("../../../../shared/utilities");
const general_responses_1 = require("../../responses/generalResponses/general.responses");
const statusCodes_responses_1 = require("../../../../shared/statusCodes/statusCodes.responses");
const otp_responses_1 = require("../../responses/otpResponses/otp.responses");
const axios_1 = __importDefault(require("axios"));
const config_1 = __importDefault(require("../../../../config/config"));
/**
 * @description Controller for user registration
 * @param request - Express Request object
 * @param response - Express Response object
 * @returns Response with user registration status
 */
// user-service registration controller
const userRegistrationController = utilities_1.errorUtilities.withControllerErrorHandling(async (request, response) => {
    const payloadDetails = request.body;
    const { email } = payloadDetails;
    try {
        const isBetaTester = await axios_1.default.get(`${config_1.default.LOCAL_FOUNDERS_LIST_URL}/beta-tester-check?email=${email}`, {
            timeout: 10000,
            headers: {
                'Content-Type': 'application/json'
            }
        });
        if (isBetaTester.status !== statusCodes_responses_1.StatusCodes.OK) {
            const errorMessage = isBetaTester.status === statusCodes_responses_1.StatusCodes.Forbidden
                ? general_responses_1.GeneralResponses.UNAUTHORIZED_FOR_TESTING
                : isBetaTester.data.message || general_responses_1.GeneralResponses.FAILED_TESTER_CHECK;
            throw utilities_1.errorUtilities.createError(errorMessage, isBetaTester.status);
        }
    }
    catch (error) {
        console.log('📊 Error details:', {
            status: error.response?.status,
            statusText: error.response?.statusText,
            data: error.response?.data,
            code: error.code
        });
        if (error.response?.status === statusCodes_responses_1.StatusCodes.NotFound) {
            throw utilities_1.errorUtilities.createError(general_responses_1.GeneralResponses.SIGNUP_AS_TESTER, statusCodes_responses_1.StatusCodes.NotFound);
        }
        else if (error.response?.status === 403) {
            throw utilities_1.errorUtilities.createError(general_responses_1.GeneralResponses.UNAUTHORIZED_FOR_TESTING, statusCodes_responses_1.StatusCodes.Forbidden);
        }
        else {
            throw utilities_1.errorUtilities.createError(general_responses_1.GeneralResponses.FAILED_TESTER_CHECK, statusCodes_responses_1.StatusCodes.InternalServerError);
        }
    }
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
    const resetPassword = await services_1.emailAuthServices.resetPasswordService({ token, newPassword, confirmNewPassword });
    return utilities_1.responseUtilities.responseHandler(response, resetPassword.message, resetPassword.statusCode, resetPassword.data);
});
exports.default = {
    userRegistrationController,
    verifyUserAccountController,
    resendVerificationOtpController,
    userLoginController,
    userPasswordResetRequestController,
    userResetPasswordController
};
