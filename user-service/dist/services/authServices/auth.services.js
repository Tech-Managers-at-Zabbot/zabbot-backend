"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const uuid_1 = require("uuid");
const index_1 = require("../../utilities/index");
// import Users from "../../models/users.models";
const axios_1 = __importDefault(require("axios"));
const users_types_1 = require("../../types/users.types");
const users_repositories_1 = __importDefault(require("../../repositories/userRepositories/users.repositories"));
const utilities_1 = require("../../../../shared/utilities");
const statusCodes_responses_1 = require("../../responses/statusCodes/statusCodes.responses");
const general_responses_1 = require("../../responses/generalResponses/general.responses");
const otp_responses_1 = require("../../responses/otpResponses/otp.responses");
const users_repositories_2 = __importDefault(require("../../repositories/userRepositories/users.repositories"));
const otp_repositories_1 = __importDefault(require("../../repositories/otpRepositories/otp.repositories"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, '../../../../.env') });
exports.config = {
    NOTIFICATION_SERVICE_ROUTE: process.env.NOTIFICATION_SERVICE_ROUTE,
    DEV_PASSWORD_RESET_URL: process.env.DEV_PASSWORD_RESET_URL,
    PROD_PASSWORD_RESET_URL: process.env.PROD_PASSWORD_RESET_URL
};
const registerUserService = utilities_1.errorUtilities.withServiceErrorHandling(async (registerPayload) => {
    const { firstName, lastName, email, password, role } = registerPayload;
    const userExists = await users_repositories_1.default.getOne({ email: email }, ['id', 'email']);
    if (userExists) {
        throw utilities_1.errorUtilities.createError(general_responses_1.GeneralResponses.EMAIL_EXISTS_LOGIN, statusCodes_responses_1.StatusCodes.BadRequest);
    }
    const newPassword = await index_1.helperFunctions.hashPassword(password);
    const createUserPayload = {
        id: (0, uuid_1.v4)(),
        firstName: firstName,
        lastName: lastName,
        email: email,
        password: newPassword,
        isVerified: role && role === users_types_1.UserRoles.ADMIN ? true : false,
        isActive: true,
        isBlocked: false,
        isFirstTimeLogin: true,
        role: role ?? users_types_1.UserRoles.USER
    };
    const newUser = await users_repositories_1.default.create(createUserPayload);
    if (!newUser) {
        throw utilities_1.errorUtilities.createError(general_responses_1.GeneralResponses.PROCESS_UNSSUCCESSFUL, statusCodes_responses_1.StatusCodes.InternalServerError);
    }
    if (createUserPayload.role === users_types_1.UserRoles.USER) {
        const otp = index_1.helperFunctions.generateOtp();
        const hashedOtp = await index_1.helperFunctions.hashPassword(otp);
        const otpData = {
            id: (0, uuid_1.v4)(),
            userId: createUserPayload.id,
            otp: hashedOtp,
            expiresAt: new Date(Date.now() + 10 * 60 * 1000),
            isUsed: false,
            notificationType: users_types_1.OtpNotificationType.EMAIL,
            attempts: 0,
            verifiedAt: null,
        };
        const otpCreated = await otp_repositories_1.default.create(otpData);
        if (!otpCreated) {
            console.log('ERROR====> OTP CREATION FAILED:', otpCreated);
        }
        const emailData = {
            email: createUserPayload.email,
            otp: otp,
            firstName: createUserPayload.firstName,
        };
        const emailPayload = {
            url: `${exports.config.NOTIFICATION_SERVICE_ROUTE}/auth-notification/welcome-otp`,
            emailData
        };
        index_1.endpointCallsUtilities.processEmailsInBackground(emailPayload).catch(error => {
            console.error(`Background email processing failed for ${createUserPayload.email}:`, error.message);
        });
    }
    return utilities_1.responseUtilities.handleServicesResponse(statusCodes_responses_1.StatusCodes.Created, role && role === users_types_1.UserRoles.ADMIN ? general_responses_1.GeneralResponses.ADMIN_REGISTRATION_SUCCESSFUL : general_responses_1.GeneralResponses.USER_REGSTRATION_SUCCESSFUL, createUserPayload.email);
});
const verifyUserAccountService = utilities_1.errorUtilities.withServiceErrorHandling(async (email, otp) => {
    const user = await users_repositories_2.default.getOne({ email }, ['id', 'email', 'role', 'isVerified']);
    if (!user) {
        throw utilities_1.errorUtilities.createError(general_responses_1.GeneralResponses.USER_NOT_FOUND, statusCodes_responses_1.StatusCodes.NotFound);
    }
    if (user.isVerified) {
        throw utilities_1.errorUtilities.createError(general_responses_1.GeneralResponses.ALREADY_VERIFIED_ACCOUNT, statusCodes_responses_1.StatusCodes.BadRequest);
    }
    const otpData = await otp_repositories_1.default.getLatestOtp({ userId: user.id, isUsed: false, notificationType: users_types_1.OtpNotificationType.EMAIL }, ['id', 'otp', 'expiresAt', 'isUsed', 'attempts']);
    if (!otpData) {
        throw utilities_1.errorUtilities.createError(otp_responses_1.OtpResponses.INVALID_OTP, statusCodes_responses_1.StatusCodes.NotFound);
    }
    if (otpData.attempts >= 4) {
        throw utilities_1.errorUtilities.createError(otp_responses_1.OtpResponses.OTP_EXCEEDED_ATTEMPTS, statusCodes_responses_1.StatusCodes.Forbidden);
    }
    const isOtpValid = await index_1.helperFunctions.comparePasswords(otp, otpData.otp);
    if (!isOtpValid) {
        await otp_repositories_1.default.updateOne({ id: otpData.id }, { attempts: otpData.attempts + 1 });
        throw utilities_1.errorUtilities.createError(otp_responses_1.OtpResponses.INVALID_OTP, statusCodes_responses_1.StatusCodes.Unauthorized);
    }
    if (otpData.expiresAt < new Date()) {
        await otp_repositories_1.default.updateOne({ id: otpData.id }, { isUsed: true });
        throw utilities_1.errorUtilities.createError(otp_responses_1.OtpResponses.OTP_EXPIRED, statusCodes_responses_1.StatusCodes.Unauthorized);
    }
    await otp_repositories_1.default.updateOne({ id: otpData.id }, { isUsed: true, verifiedAt: new Date() });
    const userId = user.id;
    await users_repositories_2.default.updateOne({
        id: userId
    }, {
        isVerified: true,
        verifiedAt: new Date()
    });
    return utilities_1.responseUtilities.handleServicesResponse(statusCodes_responses_1.StatusCodes.OK, general_responses_1.GeneralResponses.SUCCESSFUL_VERIFICATION, { email: user.email, role: user.role });
});
const resendVerificationOtpService = utilities_1.errorUtilities.withServiceErrorHandling(async (email) => {
    const user = await users_repositories_1.default.getOne({ email: email }, ['id', 'email', 'role', 'firstName', 'isVerified']);
    if (!user) {
        throw utilities_1.errorUtilities.createError(general_responses_1.GeneralResponses.USER_NOT_FOUND, statusCodes_responses_1.StatusCodes.NotFound);
    }
    if (user.isVerified) {
        throw utilities_1.errorUtilities.createError(general_responses_1.GeneralResponses.ALREADY_VERIFIED_ACCOUNT, statusCodes_responses_1.StatusCodes.BadRequest);
    }
    const otp = index_1.helperFunctions.generateOtp();
    const hashedOtp = await index_1.helperFunctions.hashPassword(otp);
    const otpData = {
        id: (0, uuid_1.v4)(),
        userId: user.id,
        otp: hashedOtp,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
        isUsed: false,
        notificationType: users_types_1.OtpNotificationType.EMAIL,
        attempts: 0,
        verifiedAt: null,
    };
    const otpCreated = await otp_repositories_1.default.create(otpData);
    if (!otpCreated) {
        console.error('ERROR====> OTP CREATION FAILED:', otpCreated);
        throw utilities_1.errorUtilities.createError(otp_responses_1.OtpResponses.OTP_CREATION_FAILED, statusCodes_responses_1.StatusCodes.InternalServerError);
    }
    const emailData = {
        email: user.email,
        otp: otp,
        firstName: user.firstName,
    };
    try {
        await axios_1.default.post(`${exports.config.NOTIFICATION_SERVICE_ROUTE}/auth-notification/resend-verification-otp`, emailData);
    }
    catch (error) {
        console.error(`Error Resending Verification Mail: ${error.message}`);
        throw utilities_1.errorUtilities.createError(otp_responses_1.OtpResponses.OTP_RESEND_FAILED, statusCodes_responses_1.StatusCodes.InternalServerError);
    }
    return utilities_1.responseUtilities.handleServicesResponse(statusCodes_responses_1.StatusCodes.Created, general_responses_1.GeneralResponses.USER_REGSTRATION_SUCCESSFUL, user.email);
});
const loginUserService = utilities_1.errorUtilities.withServiceErrorHandling(async (loginPayload) => {
    const { email, password, stayLoggedIn } = loginPayload;
    const user = await users_repositories_1.default.getOne({ email }, ['id', 'email', 'password', 'role', 'isActive', 'isBlocked', 'isVerified', 'firstName', 'lastName', 'isFirstTimeLogin']);
    if (!user) {
        throw utilities_1.errorUtilities.createError(general_responses_1.GeneralResponses.USER_NOT_FOUND, statusCodes_responses_1.StatusCodes.NotFound);
    }
    if (!user.isActive) {
        throw utilities_1.errorUtilities.createError(general_responses_1.GeneralResponses.INACTIVE_ACCOUNT, statusCodes_responses_1.StatusCodes.Forbidden);
    }
    if (user.isBlocked) {
        throw utilities_1.errorUtilities.createError(general_responses_1.GeneralResponses.BLOCKED_ACCOUNT, statusCodes_responses_1.StatusCodes.Forbidden);
    }
    if (!user.isVerified) {
        throw utilities_1.errorUtilities.createError(general_responses_1.GeneralResponses.UNVERIFIED_ACCOUNT, statusCodes_responses_1.StatusCodes.Forbidden);
    }
    const isPasswordValid = await index_1.helperFunctions.comparePasswords(password, user.password);
    if (!isPasswordValid) {
        throw utilities_1.errorUtilities.createError(general_responses_1.GeneralResponses.INVALID_CREDENTIALS, statusCodes_responses_1.StatusCodes.Unauthorized);
    }
    const tokenData = {
        data: {
            userId: user.id,
            email: user.email,
            role: user.role
        },
        expires: stayLoggedIn ? "30d" : "2h",
    };
    const token = index_1.helperFunctions.generateToken(tokenData);
    const userDetails = await users_repositories_1.default.extractUserDetails(user);
    return utilities_1.responseUtilities.handleServicesResponse(statusCodes_responses_1.StatusCodes.OK, general_responses_1.GeneralResponses.SUCCESSFUL_LOGIN, { token, user: userDetails });
});
const passwordResetRequestService = utilities_1.errorUtilities.withServiceErrorHandling(async (email) => {
    const user = await users_repositories_1.default.getOne({ email: email }, ['id', 'email', 'role', 'isVerified', 'firstName', 'isActive', 'isBlocked']);
    if (!user) {
        throw utilities_1.errorUtilities.createError(general_responses_1.GeneralResponses.USER_NOT_FOUND, statusCodes_responses_1.StatusCodes.NotFound);
    }
    if (!user.isVerified) {
        throw utilities_1.errorUtilities.createError(general_responses_1.GeneralResponses.UNVERIFIED_ACCOUNT, statusCodes_responses_1.StatusCodes.Forbidden);
    }
    if (!user.isActive) {
        throw utilities_1.errorUtilities.createError(general_responses_1.GeneralResponses.INACTIVE_ACCOUNT, statusCodes_responses_1.StatusCodes.Forbidden);
    }
    if (user.isBlocked) {
        throw utilities_1.errorUtilities.createError(general_responses_1.GeneralResponses.BLOCKED_ACCOUNT, statusCodes_responses_1.StatusCodes.Forbidden);
    }
    const tokenData = {
        data: {
            userId: user.id,
            email: user.email,
            role: user.role
        },
        expires: "10min",
    };
    const token = index_1.helperFunctions.generateToken(tokenData);
    const emailData = {
        email: user.email,
        resetUrl: `${exports.config.PROD_PASSWORD_RESET_URL}?token=${token}`,
        firstName: user.firstName
    };
    try {
        await axios_1.default.post(`${exports.config.NOTIFICATION_SERVICE_ROUTE}/auth-notification/reset-password-link`, emailData);
    }
    catch (error) {
        console.error(`Error Sending Password Reset Mail: ${error}`);
        throw utilities_1.errorUtilities.createError("Unable to send reset password link, please try again", statusCodes_responses_1.StatusCodes.InternalServerError);
    }
    return utilities_1.responseUtilities.handleServicesResponse(statusCodes_responses_1.StatusCodes.Created, "Password reset link sent successfully", user.email);
});
const resetPasswordService = utilities_1.errorUtilities.withServiceErrorHandling(async (resetPayload) => {
    const { token, newPassword, confirmNewPassword } = resetPayload;
    console.log('Reset Password Payload:', resetPayload);
    if (newPassword !== confirmNewPassword) {
        throw utilities_1.errorUtilities.createError("Passwords do not match", statusCodes_responses_1.StatusCodes.BadRequest);
    }
    const tokenValidation = index_1.helperFunctions.validateToken(token);
    const { userId } = tokenValidation;
    if (!userId) {
        console.error('ERROR====> PASSWORD RESET ERROR: Invalid token: Missing user ID');
        throw utilities_1.errorUtilities.createError("Invalid token: Missing user ID", statusCodes_responses_1.StatusCodes.BadRequest);
    }
    const user = await users_repositories_1.default.getOne({ id: userId }, ['id', 'email', 'password', 'role', 'isVerified', 'isActive', 'isBlocked', 'firstName']);
    if (!user) {
        throw utilities_1.errorUtilities.createError(general_responses_1.GeneralResponses.USER_NOT_FOUND, statusCodes_responses_1.StatusCodes.NotFound);
    }
    if (!user.isVerified) {
        throw utilities_1.errorUtilities.createError(general_responses_1.GeneralResponses.UNVERIFIED_ACCOUNT, statusCodes_responses_1.StatusCodes.Forbidden);
    }
    if (!user.isActive) {
        throw utilities_1.errorUtilities.createError(general_responses_1.GeneralResponses.INACTIVE_ACCOUNT, statusCodes_responses_1.StatusCodes.Forbidden);
    }
    if (user.isBlocked) {
        throw utilities_1.errorUtilities.createError(general_responses_1.GeneralResponses.BLOCKED_ACCOUNT, statusCodes_responses_1.StatusCodes.Forbidden);
    }
    const hashedPassword = await index_1.helperFunctions.hashPassword(newPassword);
    const updatedUser = await users_repositories_1.default.updateOne({ id: userId }, { password: hashedPassword });
    if (!updatedUser) {
        throw utilities_1.errorUtilities.createError("Password reset failed, please try again", statusCodes_responses_1.StatusCodes.InternalServerError);
    }
    const emailData = {
        email: user.email,
        firstName: user.firstName
    };
    const emailPayload = {
        url: `${exports.config.NOTIFICATION_SERVICE_ROUTE}/auth-notification/password-reset-success`,
        emailData
    };
    index_1.endpointCallsUtilities.processEmailsInBackground(emailPayload).catch(error => {
        console.error(`Background email processing failed for ${user.email}:`, error.message);
        return utilities_1.responseUtilities.handleServicesResponse(statusCodes_responses_1.StatusCodes.OK, "Password reset successful", { email: user.email });
    });
});
exports.default = {
    registerUserService,
    verifyUserAccountService,
    resendVerificationOtpService,
    loginUserService,
    passwordResetRequestService,
    resetPasswordService
};
