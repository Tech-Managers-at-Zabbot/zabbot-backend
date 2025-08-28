"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const users_repositories_1 = __importDefault(require("../../repositories/userRepositories/users.repositories"));
const uuid_1 = require("uuid");
const axios_1 = __importDefault(require("axios"));
const statusCodes_responses_1 = require("../../../../shared/statusCodes/statusCodes.responses");
const index_1 = require("../../utilities/index");
const config_1 = __importDefault(require("../../../../config/config"));
const users_repositories_2 = __importDefault(require("../../repositories/userRepositories/users.repositories"));
const user_service_types_1 = require("../../../../shared/databaseTypes/user-service-types");
const googleOAuthRegister = async (request, accessToken, refreshToken, profile, done) => {
    try {
        let user = await users_repositories_1.default.getOne({ email: profile.emails?.[0].value }, ["id", "email"]);
        if (user) {
            return done(new Error("user_already_exists"));
        }
        try {
            const isBetaTester = await axios_1.default.get(`${config_1.default.LOCAL_FOUNDERS_LIST_URL}/beta-tester-check?email=${profile.emails?.[0].value}`, {
                timeout: 10000,
                headers: {
                    "Content-Type": "application/json",
                },
            });
            if (isBetaTester.status !== statusCodes_responses_1.StatusCodes.OK) {
                const errorMessage = isBetaTester.status === statusCodes_responses_1.StatusCodes.Forbidden
                    ? "unauthorized_for_testing"
                    : "failed_tester_check";
                return done(new Error(errorMessage));
            }
        }
        catch (err) {
            console.log("📊 Registration Error details:", {
                status: err.response?.status,
                statusText: err.response?.statusText,
                data: err.response?.data,
                code: err.code,
            });
            let customError = "authentication_failed";
            if (err.response?.status === statusCodes_responses_1.StatusCodes.NotFound) {
                customError = "signup_as_tester";
            }
            else if (err.response?.status === 403) {
                customError = "unauthorized_for_testing";
            }
            else {
                customError = "failed_tester_check";
            }
            return done(new Error(customError));
        }
        // Create new user
        const createUserPayload = {
            id: (0, uuid_1.v4)(),
            firstName: profile?.name?.givenName || "",
            lastName: profile?.name?.familyName || "",
            email: profile?.emails?.[0].value || "",
            isVerified: true,
            isActive: true,
            isBlocked: false,
            isFirstTimeLogin: true,
            role: user_service_types_1.UserRoles.USER,
            profilePicture: profile?.photos?.[0].value,
            googleAccessToken: accessToken,
            googleRefreshToken: refreshToken,
            registerMethod: user_service_types_1.RegisterMethods.GOOGLE,
            timeZone: request?.query?.state ||
                Intl.DateTimeFormat().resolvedOptions().timeZone,
        };
        await users_repositories_1.default.create(createUserPayload);
        const newUser = await users_repositories_2.default.getByPK(createUserPayload.id);
        const accessTokenData = {
            data: {
                userId: newUser.id,
                email: newUser.email,
                role: newUser.role,
            },
            expires: "2h",
        };
        const refreshTokenData = {
            data: {
                userId: newUser.id,
                email: newUser.email,
                role: newUser.role,
            },
            expires: "30d",
        };
        const appAccessToken = index_1.helperFunctions.generateToken(accessTokenData);
        const appRefreshToken = index_1.helperFunctions.generateToken(refreshTokenData);
        await users_repositories_2.default.updateOne({
            id: newUser.id,
        }, {
            refreshToken: appRefreshToken,
        });
        const userDetails = await users_repositories_1.default.extractUserDetails(newUser);
        userDetails.languageId = config_1.default.YORUBA_LANGUAGE_ID;
        const emailData = {
            email: createUserPayload.email,
            firstName: createUserPayload.firstName,
        };
        const emailPayload = {
            url: `${config_1.default.NOTIFICATION_SERVICE_ROUTE}/auth-notification/welcome-otp`,
            emailData,
        };
        index_1.endpointCallsUtilities
            .processEmailsInBackground(emailPayload)
            .catch((error) => {
            console.error(`Background email processing failed for ${createUserPayload.email}:`, error.message);
        });
        done(null, {
            token: appAccessToken,
            user: userDetails,
            authType: "registration",
        });
    }
    catch (err) {
        return done(new Error("registration_failed"));
    }
};
const googleOAuthLogin = async (request, accessToken, refreshToken, profile, done) => {
    try {
        let user = await users_repositories_1.default.getOne({ email: profile.emails?.[0].value }, [
            "id",
            "email",
            "firstName",
            "lastName",
            "isActive",
            "isBlocked",
            "registerMethod",
        ]);
        if (!user) {
            return done(new Error("user_not_found_please_register"));
        }
        if (user.registerMethod !== "google") {
            return done(new Error("user_used_another_login_method"));
        }
        if (!user.isActive || user.isBlocked) {
            return done(new Error("account_inactive_or_blocked"));
        }
        const newUser = await users_repositories_2.default.getByPK(user.id);
        const accessTokenData = {
            data: {
                userId: newUser.id,
                email: newUser.email,
                role: newUser.role,
            },
            expires: "2h",
        };
        const refreshTokenData = {
            data: {
                userId: newUser.id,
                email: newUser.email,
                role: newUser.role,
            },
            expires: "30d",
        };
        const appAccessToken = index_1.helperFunctions.generateToken(accessTokenData);
        const appRefreshToken = index_1.helperFunctions.generateToken(refreshTokenData);
        await users_repositories_1.default.updateOne({ email: user.email }, {
            googleAccessToken: accessToken,
            googleRefreshToken: refreshToken,
            refreshToken: appRefreshToken,
            timeZone: request?.query?.state ||
                Intl.DateTimeFormat().resolvedOptions().timeZone,
        });
        const userDetails = await users_repositories_1.default.extractUserDetails(newUser);
        userDetails.languageId = config_1.default.YORUBA_LANGUAGE_ID;
        done(null, { token: appAccessToken, user: userDetails, authType: "login" });
    }
    catch (err) {
        return done(new Error("login_failed"));
    }
};
exports.default = {
    googleOAuthRegister,
    googleOAuthLogin,
};
