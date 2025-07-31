import { v4 } from "uuid";
import { helperFunctions, endpointCallsUtilities } from "../../utilities/index";
// import Users from "../../models/users.models";
import axios from "axios";
import {
  OtpAttributes,
  OtpNotificationType,
  RegisterMethods,
  UserAttributes,
  UserRoles,
} from "../../types/users.types";
import usersRepositories from "../../repositories/userRepositories/users.repositories";
import {
  responseUtilities,
  errorUtilities,
} from "../../../../shared/utilities";
import {
  SpecialCodeMessage,
  StatusCodes,
} from "../../../../shared/statusCodes/statusCodes.responses";
import { GeneralResponses } from "../../responses/generalResponses/general.responses";
import { OtpResponses } from "../../responses/otpResponses/otp.responses";
import userRepositories from "../../repositories/userRepositories/users.repositories";
import otpRepositories from "../../repositories/otpRepositories/otp.repositories";
import config from "../../../../config/config";

const registerUserService = errorUtilities.withServiceErrorHandling(
  async (registerPayload: UserAttributes) => {
    const { firstName, lastName, email, password, role, timeZone } = registerPayload;

    const userExists = await usersRepositories.getOne({ email: email }, [
      "id",
      "email",
    ]);

    if (userExists) {
      throw errorUtilities.createError(
        GeneralResponses.EMAIL_EXISTS_LOGIN,
        StatusCodes.BadRequest
      );
    }

    const newPassword = await helperFunctions.hashPassword(password);

    const createUserPayload = {
      id: v4(),
      firstName: firstName,
      lastName: lastName,
      email: email,
      password: newPassword,
      isVerified: role && role === UserRoles.ADMIN ? true : false,
      isActive: true,
      isBlocked: false,
      timeZone,
      isFirstTimeLogin: true,
      role: role ?? UserRoles.USER,
      registerMethod: RegisterMethods.EMAIL,
    };

    const newUser = await usersRepositories.create(createUserPayload);

    if (!newUser) {
      throw errorUtilities.createError(
        GeneralResponses.PROCESS_UNSSUCCESSFUL,
        StatusCodes.InternalServerError
      );
    }
    if (createUserPayload.role === UserRoles.USER) {
      const otp = helperFunctions.generateOtp();

      const hashedOtp = await helperFunctions.hashPassword(otp);

      const otpData = {
        id: v4(),
        userId: createUserPayload.id,
        otp: hashedOtp,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
        isUsed: false,
        notificationType: OtpNotificationType.EMAIL,
        attempts: 0,
        verifiedAt: null,
      };

      const otpCreated = await otpRepositories.create(otpData);
      if (!otpCreated) {
        console.error("ERROR====> OTP CREATION FAILED:", otpCreated);
      }

      const emailData = {
        email: createUserPayload.email,
        otp: otp,
        firstName: createUserPayload.firstName,
      };

      const emailPayload = {
        url: `${config.NOTIFICATION_SERVICE_ROUTE}/auth-notification/welcome-otp`,
        emailData,
      };

      endpointCallsUtilities
        .processEmailsInBackground(emailPayload)
        .catch((error) => {
          console.error(
            `Background email processing failed for ${createUserPayload.email}:`,
            error.message
          );
        });
    }

    return responseUtilities.handleServicesResponse(
      StatusCodes.Created,
      role && role === UserRoles.ADMIN
        ? GeneralResponses.ADMIN_REGISTRATION_SUCCESSFUL
        : GeneralResponses.USER_REGSTRATION_SUCCESSFUL,
      createUserPayload.email
    );
  }
);

const verifyUserAccountService = errorUtilities.withServiceErrorHandling(
  async (email: string, otp: string) => {
    const user = await userRepositories.getOne({ email }, [
      "id",
      "email",
      "role",
      "isVerified",
    ]);

    if (!user) {
      throw errorUtilities.createError(
        GeneralResponses.USER_NOT_FOUND,
        StatusCodes.NotFound
      );
    }

    if (user.isVerified) {
      throw errorUtilities.createError(
        GeneralResponses.ALREADY_VERIFIED_ACCOUNT,
        StatusCodes.BadRequest
      );
    }

    const otpData: OtpAttributes | any = await otpRepositories.getLatestOtp(
      {
        userId: user.id,
        isUsed: false,
        notificationType: OtpNotificationType.EMAIL,
      },
      ["id", "otp", "expiresAt", "isUsed", "attempts"]
    );

    if (!otpData) {
      throw errorUtilities.createError(
        OtpResponses.INVALID_OTP,
        StatusCodes.NotFound
      );
    }
    if (otpData.attempts >= 4) {
      throw errorUtilities.createError(
        OtpResponses.OTP_EXCEEDED_ATTEMPTS,
        StatusCodes.Forbidden
      );
    }
    const isOtpValid = await helperFunctions.comparePasswords(otp, otpData.otp);

    if (!isOtpValid) {
      await otpRepositories.updateOne(
        { id: otpData.id },
        { attempts: otpData.attempts + 1 }
      );
      throw errorUtilities.createError(
        OtpResponses.INVALID_OTP,
        StatusCodes.Unauthorized
      );
    }

    if (otpData.expiresAt < new Date()) {
      await otpRepositories.updateOne({ id: otpData.id }, { isUsed: true });
      throw errorUtilities.createError(
        OtpResponses.OTP_EXPIRED,
        StatusCodes.Unauthorized
      );
    }

    await otpRepositories.updateOne(
      { id: otpData.id },
      { isUsed: true, verifiedAt: new Date() }
    );

    const userId = user.id;

    await userRepositories.updateOne(
      {
        id: userId,
      },
      {
        isVerified: true,
        verifiedAt: new Date(),
      }
    );

    return responseUtilities.handleServicesResponse(
      StatusCodes.OK,
      GeneralResponses.SUCCESSFUL_VERIFICATION,
      { email: user.email, role: user.role }
    );
  }
);

const resendVerificationOtpService = errorUtilities.withServiceErrorHandling(
  async (email: string) => {
    const user = await usersRepositories.getOne({ email: email }, [
      "id",
      "email",
      "role",
      "firstName",
      "isVerified",
    ]);

    if (!user) {
      throw errorUtilities.createError(
        GeneralResponses.USER_NOT_FOUND,
        StatusCodes.NotFound
      );
    }

    if (user.isVerified) {
      throw errorUtilities.createError(
        GeneralResponses.ALREADY_VERIFIED_ACCOUNT,
        StatusCodes.BadRequest
      );
    }

    const otp = helperFunctions.generateOtp();

    const hashedOtp = await helperFunctions.hashPassword(otp);

    const otpData = {
      id: v4(),
      userId: user.id,
      otp: hashedOtp,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      isUsed: false,
      notificationType: OtpNotificationType.EMAIL,
      attempts: 0,
      verifiedAt: null,
    };

    const otpCreated = await otpRepositories.create(otpData);
    if (!otpCreated) {
      console.error("ERROR====> OTP CREATION FAILED:", otpCreated);
      throw errorUtilities.createError(
        OtpResponses.OTP_CREATION_FAILED,
        StatusCodes.InternalServerError
      );
    }
    const emailData = {
      email: user.email,
      otp: otp,
      firstName: user.firstName,
    };
    try {
      await axios.post(
        `${config.NOTIFICATION_SERVICE_ROUTE}/auth-notification/resend-verification-otp`,
        emailData
      );
    } catch (error: any) {
      console.error(`Error Resending Verification Mail: ${error.message}`);
      throw errorUtilities.createError(
        OtpResponses.OTP_RESEND_FAILED,
        StatusCodes.InternalServerError
      );
    }

    return responseUtilities.handleServicesResponse(
      StatusCodes.Created,
      GeneralResponses.USER_REGSTRATION_SUCCESSFUL,
      user.email
    );
  }
);

const loginUserService = errorUtilities.withServiceErrorHandling(
  async (loginPayload: {
    email: string;
    password: string;
    stayLoggedIn: boolean;
    timeZone: string;
  }) => {
    const { email, password, stayLoggedIn, timeZone } = loginPayload;

    const user = await usersRepositories.getOne({ email });

    if (!user) {
      throw errorUtilities.createError(
        GeneralResponses.USER_NOT_FOUND,
        StatusCodes.NotFound
      );
    }

    if (!user.isActive) {
      throw errorUtilities.createError(
        GeneralResponses.INACTIVE_ACCOUNT,
        StatusCodes.Forbidden
      );
    }

    if (user.isBlocked) {
      throw errorUtilities.createError(
        GeneralResponses.BLOCKED_ACCOUNT,
        StatusCodes.Forbidden
      );
    }

    if (!user.isVerified) {
      const unverified_message = SpecialCodeMessage.UNVERIFIED_ACCOUNT;

      const codeDetails = [unverified_message, user?.email];

      const otp = helperFunctions.generateOtp();

      const hashedOtp = await helperFunctions.hashPassword(otp);

      const otpData = {
        id: v4(),
        userId: user.id,
        otp: hashedOtp,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
        isUsed: false,
        notificationType: OtpNotificationType.EMAIL,
        attempts: 0,
        verifiedAt: null,
      };

      const otpCreated = await otpRepositories.create(otpData);

      if (!otpCreated) {
        console.error("ERROR====> OTP CREATION FAILED:", otpCreated);
        throw errorUtilities.createError(
          GeneralResponses.UNVERIFIED_ACCOUNT,
          StatusCodes.InternalServerError,
          codeDetails
        );
      }
      const emailData = {
        email: user.email,
        otp: otp,
        firstName: user.firstName,
      };
      try {
        await axios.post(
          `${config.NOTIFICATION_SERVICE_ROUTE}/auth-notification/resend-verification-otp`,
          emailData
        );
      } catch (error: any) {
        console.error(`Error Resending Verification Mail: ${error.message}`);
        throw errorUtilities.createError(
          GeneralResponses.UNVERIFIED_ACCOUNT,
          StatusCodes.InternalServerError,
          codeDetails
        );
      }
      throw errorUtilities.createError(
        GeneralResponses.UNVERIFIED_ACCOUNT,
        StatusCodes.Forbidden,
        codeDetails
      );
    }

    const isPasswordValid = await helperFunctions.comparePasswords(
      password,
      user.password
    );

    if (!isPasswordValid) {
      throw errorUtilities.createError(
        GeneralResponses.INVALID_CREDENTIALS,
        StatusCodes.Unauthorized
      );
    }

    const accessTokenData = {
      data: {
        userId: user.id,
        email: user.email,
        role: user.role,
      },
      expires: "2h",
    };

    const refreshTokenData = {
      data: {
        userId: user.id,
        email: user.email,
        role: user.role,
      },
      expires: "30d",
    };

    const accessToken = helperFunctions.generateToken(accessTokenData);
    const refreshToken = helperFunctions.generateToken(refreshTokenData);

    await userRepositories.updateOne(
      {
        id: user.id,
      },
      {
        refreshToken,
        timeZone
      }
    );

    const userDetails:Record<string, any> = await usersRepositories.extractUserDetails(user);

    userDetails.languageId = config.YORUBA_LANGUAGE_ID!

    return responseUtilities.handleServicesResponse(
      StatusCodes.OK,
      GeneralResponses.SUCCESSFUL_LOGIN,
      { token: accessToken, user: userDetails }
    );
  }
);

const passwordResetRequestService = errorUtilities.withServiceErrorHandling(
  async (email: string) => {
    const user = await usersRepositories.getOne({ email: email }, [
      "id",
      "email",
      "role",
      "isVerified",
      "firstName",
      "isActive",
      "isBlocked",
    ]);
    if (!user) {
      throw errorUtilities.createError(
        GeneralResponses.USER_NOT_FOUND,
        StatusCodes.NotFound
      );
    }
    if (!user.isVerified) {
      throw errorUtilities.createError(
        GeneralResponses.UNVERIFIED_ACCOUNT,
        StatusCodes.Forbidden
      );
    }
    if (!user.isActive) {
      throw errorUtilities.createError(
        GeneralResponses.INACTIVE_ACCOUNT,
        StatusCodes.Forbidden
      );
    }

    if (user.isBlocked) {
      throw errorUtilities.createError(
        GeneralResponses.BLOCKED_ACCOUNT,
        StatusCodes.Forbidden
      );
    }
    const tokenData = {
      data: {
        userId: user.id,
        email: user.email,
        role: user.role,
      },
      expires: "10min",
    };
    const token = helperFunctions.generateToken(tokenData);

    const emailData = {
      email: user.email,
      resetUrl: `${config.PASSWORD_RESET_URL!}?token=${token}`,
      firstName: user.firstName,
    };
    try {
      await axios.post(
        `${config.NOTIFICATION_SERVICE_ROUTE}/auth-notification/reset-password-link`,
        emailData,
        {
          timeout: 100000,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      // if (sendLink.status !== 200) {
      //     // const errorMessage = sendLink.status === 403
      //     //     ? "User is not authorized for beta testing"
      //     //     : sendLink.data.message || "Beta tester check failed";
      //     throw errorUtilities.createError(errorMessage, sendLink.status);
      // }
    } catch (error: any) {
      console.log("📊 Error details:", {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        code: error.code,
        message: error.message,
      });
      // if (error.response?.status === 404) {
      //         throw errorUtilities.createError("User not found in founders circle, please join the founders circle", 404);
      //     } else if (error.response?.status === 403) {
      //             throw errorUtilities.createError("User is not authorized for beta testing", 403);
      //         } else {
      throw errorUtilities.createError(
        error?.response?.data?.message,
        error?.response?.status
      );
      // }
    }
    return responseUtilities.handleServicesResponse(
      StatusCodes.Created,
      GeneralResponses.SUCCESSFUL_PASSWORD_RESET_LINK_SENT,
      user.email
    );
  }
);

const resetPasswordService = errorUtilities.withServiceErrorHandling(
  async (resetPayload: {
    token: string;
    newPassword: string;
    confirmNewPassword: string;
  }) => {
    const { token, newPassword, confirmNewPassword } = resetPayload;
    if (newPassword !== confirmNewPassword) {
      throw errorUtilities.createError(
        GeneralResponses.MISMATCHED_PASSEORD,
        StatusCodes.BadRequest
      );
    }
    const tokenValidation = helperFunctions.validateToken(token);
    const { userId } = tokenValidation as { userId: string };
    if (!userId) {
      console.error(
        "ERROR====> PASSWORD RESET ERROR: Invalid token: Missing user ID"
      );
      throw errorUtilities.createError(
        GeneralResponses.INVALID_TOKEN,
        StatusCodes.BadRequest
      );
    }
    const user = await usersRepositories.getOne({ id: userId }, [
      "id",
      "email",
      "password",
      "role",
      "isVerified",
      "isActive",
      "isBlocked",
      "firstName",
    ]);
    if (!user) {
      throw errorUtilities.createError(
        GeneralResponses.USER_NOT_FOUND,
        StatusCodes.NotFound
      );
    }
    if (!user.isVerified) {
      throw errorUtilities.createError(
        GeneralResponses.UNVERIFIED_ACCOUNT,
        StatusCodes.Forbidden
      );
    }
    if (!user.isActive) {
      throw errorUtilities.createError(
        GeneralResponses.INACTIVE_ACCOUNT,
        StatusCodes.Forbidden
      );
    }

    if (user.isBlocked) {
      throw errorUtilities.createError(
        GeneralResponses.BLOCKED_ACCOUNT,
        StatusCodes.Forbidden
      );
    }
    const hashedPassword = await helperFunctions.hashPassword(newPassword);
    const updatedUser = await usersRepositories.updateOne(
      { id: userId },
      { password: hashedPassword }
    );
    if (!updatedUser) {
      throw errorUtilities.createError(
        GeneralResponses.FAILED_PASSWORD_RESET,
        StatusCodes.InternalServerError
      );
    }
    const emailData = {
      email: user.email,
      firstName: user.firstName,
    };
    const emailPayload = {
      url: `${config.NOTIFICATION_SERVICE_ROUTE}/auth-notification/password-reset-success`,
      emailData,
    };
    endpointCallsUtilities
      .processEmailsInBackground(emailPayload)
      .catch((error) => {
        console.error(
          `Background email processing failed for ${user.email}:`,
          error.message
        );
      });
    return responseUtilities.handleServicesResponse(
      StatusCodes.OK,
      GeneralResponses.SUCCESSFUL_PASSWORD_RESET,
      { email: user.email }
    );
  }
);



export default {
  registerUserService,
  verifyUserAccountService,
  resendVerificationOtpService,
  loginUserService,
  passwordResetRequestService,
  resetPasswordService,
};
