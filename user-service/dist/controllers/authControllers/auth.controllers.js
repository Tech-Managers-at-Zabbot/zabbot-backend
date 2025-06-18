"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const services_1 = require("../../services");
const utilities_1 = require("../../../../shared/utilities");
const statusCodes_responses_1 = require("../../responses/statusCodes/statusCodes.responses");
const otp_responses_1 = require("../../responses/otpResponses/otp.responses");
const axios_1 = __importDefault(require("axios"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, '../../../../.env') });
exports.config = {
    LOCAL_FOUNDERS_LIST_URL: process.env.LOCAL_FOUNDERS_LIST_URL,
};
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
        const isBetaTester = await axios_1.default.get(`${exports.config.LOCAL_FOUNDERS_LIST_URL}/beta-tester-check?email=${email}`, {
            timeout: 10000,
            headers: {
                'Content-Type': 'application/json'
            }
        });
        if (isBetaTester.status !== 200) {
            const errorMessage = isBetaTester.status === 403
                ? "User is not authorized for beta testing"
                : isBetaTester.data.message || "Beta tester check failed";
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
        if (error.response?.status === 404) {
            throw utilities_1.errorUtilities.createError("User not found in founders circle, please join the founders circle", 404);
        }
        else if (error.response?.status === 403) {
            throw utilities_1.errorUtilities.createError("User is not authorized for beta testing", 403);
        }
        else {
            throw utilities_1.errorUtilities.createError("Beta tester check failed", 500);
        }
    }
    console.log('👤 Proceeding with user registration...');
    const registerUser = await services_1.authServices.registerUserService(payloadDetails);
    return utilities_1.responseUtilities.responseHandler(response, registerUser.message, registerUser.statusCode, registerUser.data);
});
const verifyUserAccountController = utilities_1.errorUtilities.withControllerErrorHandling(async (request, response) => {
    const { email, otp } = request.body;
    if (!otp) {
        throw utilities_1.errorUtilities.createError(otp_responses_1.OtpResponses.ENTER_OTP, statusCodes_responses_1.StatusCodes.BadRequest);
    }
    const verifiedUser = await services_1.authServices.verifyUserAccountService(email, otp);
    return utilities_1.responseUtilities.responseHandler(response, verifiedUser.message, verifiedUser.statusCode, verifiedUser.data);
});
const resendVerificationOtpController = utilities_1.errorUtilities.withControllerErrorHandling(async (request, response) => {
    const { email } = request.body;
    const resendLink = await services_1.authServices.resendVerificationOtpService(email);
    return utilities_1.responseUtilities.responseHandler(response, resendLink.message, resendLink.statusCode, resendLink.data);
});
const userLoginController = utilities_1.errorUtilities.withControllerErrorHandling(async (request, response) => {
    const payloadDetails = request.body;
    const userLogin = await services_1.authServices.loginUserService(payloadDetails);
    return utilities_1.responseUtilities.responseHandler(response, userLogin.message, userLogin.statusCode, userLogin.data);
});
const userPasswordResetRequestController = utilities_1.errorUtilities.withControllerErrorHandling(async (request, response) => {
    const { email } = request.body;
    const requestPasswordReset = await services_1.authServices.passwordResetRequestService(email);
    return utilities_1.responseUtilities.responseHandler(response, requestPasswordReset.message, requestPasswordReset.statusCode, requestPasswordReset.data);
});
const userResetPasswordController = utilities_1.errorUtilities.withControllerErrorHandling(async (request, response) => {
    const { token, newPassword, confirmNewPassword } = request.body;
    console.log(`Reset Password Request: ${JSON.stringify(request.body)}`);
    const requestPasswordReset = await services_1.authServices.resetPasswordService({ token, newPassword, confirmNewPassword });
    return utilities_1.responseUtilities.responseHandler(response, requestPasswordReset.message, requestPasswordReset.statusCode, requestPasswordReset.data);
});
exports.default = {
    userRegistrationController,
    verifyUserAccountController,
    resendVerificationOtpController,
    userLoginController,
    userPasswordResetRequestController,
    userResetPasswordController
};
