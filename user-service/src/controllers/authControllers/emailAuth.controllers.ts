import { Request, Response } from "express";
import { emailAuthServices } from "../../services";
import {
  responseUtilities,
  errorUtilities,
} from "../../../../shared/utilities";
import { GeneralResponses } from "../../responses/generalResponses/general.responses";
import { StatusCodes } from "../../../../shared/statusCodes/statusCodes.responses";
import { OtpResponses } from "../../responses/otpResponses/otp.responses";
import axios from "axios";
import config from "../../../../config/config";
import { JwtPayload } from "jsonwebtoken";

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

    const registerUser =
      await emailAuthServices.registerUserService(payloadDetails);

    return responseUtilities.responseHandler(
      response,
      registerUser.message,
      registerUser.statusCode,
      registerUser.data,
    );
  },
);

const verifyUserAccountController = errorUtilities.withControllerErrorHandling(
  async (request: Request, response: Response) => {
    const { email, otp } = request.body;
    if (!otp) {
      throw errorUtilities.createError(
        OtpResponses.ENTER_OTP,
        StatusCodes.BadRequest,
      );
    }
    const verifiedUser = await emailAuthServices.verifyUserAccountService(
      email,
      otp,
    );
    return responseUtilities.responseHandler(
      response,
      verifiedUser.message,
      verifiedUser.statusCode,
      verifiedUser.data,
    );
  },
);

const resendVerificationOtpController =
  errorUtilities.withControllerErrorHandling(
    async (request: Request, response: Response) => {
      const { email } = request.body;
      const resendLink =
        await emailAuthServices.resendVerificationOtpService(email);
      return responseUtilities.responseHandler(
        response,
        resendLink.message,
        resendLink.statusCode,
        resendLink.data,
      );
    },
  );

const userLoginController = errorUtilities.withControllerErrorHandling(
  async (request: Request, response: Response) => {
    const payloadDetails = request.body;
    const userLogin = await emailAuthServices.loginUserService(payloadDetails);
    return responseUtilities.responseHandler(
      response,
      userLogin.message,
      userLogin.statusCode,
      userLogin.data,
    );
  },
);

const userPasswordResetRequestController =
  errorUtilities.withControllerErrorHandling(
    async (request: Request, response: Response) => {
      const { email } = request.body;
      const requestPasswordReset =
        await emailAuthServices.passwordResetRequestService(email);
      return responseUtilities.responseHandler(
        response,
        requestPasswordReset.message,
        requestPasswordReset.statusCode,
        requestPasswordReset.data,
      );
    },
  );

const userResetPasswordController = errorUtilities.withControllerErrorHandling(
  async (request: Request, response: Response) => {
    const { token, newPassword, confirmNewPassword } = request.body;
    const resetPassword = await emailAuthServices.resetPasswordService({
      token,
      newPassword,
      confirmNewPassword,
    });
    return responseUtilities.responseHandler(
      response,
      resetPassword.message,
      resetPassword.statusCode,
      resetPassword.data,
    );
  },
);

const changeUserPasswordController = errorUtilities.withControllerErrorHandling(
  async (request: JwtPayload, response: Response) => {
    const { userId } = request.user;
    const { currentPassword, newPassword, confirmNewPassword } = request.body;
    const changePassword = await emailAuthServices.changePasswordService(
      userId,
      currentPassword,
      newPassword,
      confirmNewPassword,
    );
    return responseUtilities.responseHandler(
      response,
      changePassword.message,
      changePassword.statusCode,
      changePassword.data,
    );
  },
);

const updateUserNamesController = errorUtilities.withControllerErrorHandling(
  async (request: JwtPayload, response: Response) => {
    const { userId } = request.user;
    const updatedData = await emailAuthServices.editUserNamesService(
      request.body,
      userId,
    );
    return responseUtilities.responseHandler(
      response,
      updatedData.message,
      updatedData.statusCode,
      updatedData.data,
    );
  },
);

const getSingleUserDetailsController =
  errorUtilities.withControllerErrorHandling(
    async (request: JwtPayload, response: Response) => {
      const { userId } = request.user;
      console.log("11", userId);
      const singleUserDetails =
        await emailAuthServices.getSingleUserDetailsService(userId);
      return responseUtilities.responseHandler(
        response,
        singleUserDetails.message,
        singleUserDetails.statusCode,
        singleUserDetails.data,
      );
    },
  );

export default {
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
