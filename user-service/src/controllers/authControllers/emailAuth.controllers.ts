import { Request, Response } from "express";
import { emailAuthServices } from "../../services";
import { responseUtilities, errorUtilities } from "../../../../shared/utilities";
import { GeneralResponses } from "../../responses/generalResponses/general.responses";
import { StatusCodes } from "../../responses/statusCodes/statusCodes.responses";
import { OtpResponses } from "../../responses/otpResponses/otp.responses";
import axios from "axios";
import config from '../../../../config/config';

/**
 * @description Controller for user registration
 * @param request - Express Request object
 * @param response - Express Response object
 * @returns Response with user registration status
 */

// user-service registration controller
const userRegistrationController = errorUtilities.withControllerErrorHandling(
    async (request: Request, response: Response) => {
        const payloadDetails = request.body;
        const { email } = payloadDetails;


        try {
            const isBetaTester = await axios.get(
                `${config.LOCAL_FOUNDERS_LIST_URL}/beta-tester-check?email=${email}`,
                {
                    timeout: 10000,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (isBetaTester.status !== StatusCodes.OK) {
                const errorMessage = isBetaTester.status === StatusCodes.Forbidden
                    ? GeneralResponses.UNAUTHORIZED_FOR_TESTING
                    : isBetaTester.data.message || GeneralResponses.FAILED_TESTER_CHECK;
                throw errorUtilities.createError(errorMessage, isBetaTester.status);
            }

        } catch (error: any) {
            console.log('📊 Error details:', {
                status: error.response?.status,
                statusText: error.response?.statusText,
                data: error.response?.data,
                code: error.code
            });
            if (error.response?.status === StatusCodes.NotFound) {
                throw errorUtilities.createError(GeneralResponses.SIGNUP_AS_TESTER, StatusCodes.NotFound);
            } else if (error.response?.status === 403) {
                throw errorUtilities.createError(GeneralResponses.UNAUTHORIZED_FOR_TESTING, StatusCodes.Forbidden);
            } else {
                throw errorUtilities.createError(GeneralResponses.FAILED_TESTER_CHECK, StatusCodes.InternalServerError);
            }
        }
        const registerUser = await emailAuthServices.registerUserService(payloadDetails);

        return responseUtilities.responseHandler(
            response,
            registerUser.message,
            registerUser.statusCode,
            registerUser.data
        );
    }
);


const verifyUserAccountController = errorUtilities.withControllerErrorHandling(async (request: Request, response: Response) => {
    const { email, otp } = request.body;
    if (!otp) {
        throw errorUtilities.createError(OtpResponses.ENTER_OTP, StatusCodes.BadRequest);
    }
    const verifiedUser = await emailAuthServices.verifyUserAccountService(email, otp)
    return responseUtilities.responseHandler(
        response,
        verifiedUser.message,
        verifiedUser.statusCode,
        verifiedUser.data
    )
})

const resendVerificationOtpController = errorUtilities.withControllerErrorHandling(async (request: Request, response: Response) => {
    const { email } = request.body;
    const resendLink = await emailAuthServices.resendVerificationOtpService(email);
    return responseUtilities.responseHandler(
        response,
        resendLink.message,
        resendLink.statusCode,
        resendLink.data
    )
})

const userLoginController = errorUtilities.withControllerErrorHandling(async (request: Request, response: Response) => {
    const payloadDetails = request.body;
    const userLogin = await emailAuthServices.loginUserService(payloadDetails)
    return responseUtilities.responseHandler(
        response,
        userLogin.message,
        userLogin.statusCode,
        userLogin.data
    )
})

const userPasswordResetRequestController = errorUtilities.withControllerErrorHandling(async (request: Request, response: Response) => {
    const { email } = request.body;
    const requestPasswordReset = await emailAuthServices.passwordResetRequestService(email)
    return responseUtilities.responseHandler(
        response,
        requestPasswordReset.message,
        requestPasswordReset.statusCode,
        requestPasswordReset.data
    )
})


const userResetPasswordController = errorUtilities.withControllerErrorHandling(async (request: Request, response: Response) => {
    const { token, newPassword, confirmNewPassword } = request.body;
    const resetPassword = await emailAuthServices.resetPasswordService({ token, newPassword, confirmNewPassword })
    return responseUtilities.responseHandler(
        response,
        resetPassword.message,
        resetPassword.statusCode,
        resetPassword.data
    )
})

export default {
    userRegistrationController,
    verifyUserAccountController,
    resendVerificationOtpController,
    userLoginController,
    userPasswordResetRequestController,
    userResetPasswordController
}