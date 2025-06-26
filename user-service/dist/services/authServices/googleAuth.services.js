"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const users_repositories_1 = __importDefault(require("../../repositories/userRepositories/users.repositories"));
const uuid_1 = require("uuid");
const users_types_1 = require("../../types/users.types");
const axios_1 = __importDefault(require("axios"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const statusCodes_responses_1 = require("../../responses/statusCodes/statusCodes.responses");
const index_1 = require("../../utilities/index");
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, '../../../../.env') });
exports.config = {
    LOCAL_FOUNDERS_LIST_URL: process.env.LOCAL_FOUNDERS_LIST_URL,
    NOTIFICATION_SERVICE_ROUTE: process.env.NOTIFICATION_SERVICE_ROUTE,
};
const googleOAuthVerify = async (accessToken, refreshToken, profile, done) => {
    try {
        let user = await users_repositories_1.default.getOne({ email: profile.emails?.[0].value }, ["id", "email"]);
        if (!user) {
            try {
                const isBetaTester = await axios_1.default.get(`${exports.config.LOCAL_FOUNDERS_LIST_URL}/beta-tester-check?email=${profile.emails?.[0].value}`, {
                    timeout: 10000,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                if (isBetaTester.status !== statusCodes_responses_1.StatusCodes.OK) {
                    const errorMessage = isBetaTester.status === statusCodes_responses_1.StatusCodes.Forbidden
                        ? 'unauthorized_for_testing'
                        : 'failed_tester_check';
                    // Pass custom error info to be used in failureRedirect
                    return done(new Error(errorMessage));
                    // return done(null, false, { message: errorMessage });
                }
            }
            catch (err) {
                console.log('📊 Error details:', {
                    status: err.response?.status,
                    statusText: err.response?.statusText,
                    data: err.response?.data,
                    code: err.code
                });
                let customError = 'authentication_failed';
                if (err.response?.status === statusCodes_responses_1.StatusCodes.NotFound) {
                    customError = 'signup_as_tester';
                }
                else if (err.response?.status === 403) {
                    customError = 'unauthorized_for_testing';
                }
                else {
                    customError = 'failed_tester_check';
                }
                // Pass custom error info to be used in failureRedirect
                return done(new Error(customError));
                // return done(null, false, { message: customError });
            }
            const createUserPayload = {
                id: (0, uuid_1.v4)(),
                firstName: profile?.name?.givenName || '',
                lastName: profile?.name?.familyName || '',
                email: profile?.emails?.[0].value || '',
                isVerified: true,
                isActive: true,
                isBlocked: false,
                isFirstTimeLogin: true,
                role: users_types_1.UserRoles.USER,
                profilePicture: profile?.photos?.[0].value,
                googleAccessToken: accessToken,
                googleRefreshToken: refreshToken,
                registerMethod: users_types_1.RegisterMethods.GOOGLE
            };
            user = await users_repositories_1.default.create(createUserPayload);
            const emailData = {
                email: createUserPayload.email,
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
        else {
            await users_repositories_1.default.updateOne({
                email: user.email
            }, {
                googleAccessToken: accessToken,
                googleRefreshToken: refreshToken,
            });
        }
        done(null, user);
    }
    catch (err) {
        return done(new Error('authentication_failed'));
        // done(null, false, { message: 'authentication_failed' });
    }
};
exports.default = {
    googleOAuthVerify
};
