"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const utilities_1 = require("../../../../shared/utilities");
const config_1 = __importDefault(require("../../../../config/config"));
const googleAuthFailure = utilities_1.errorUtilities.withControllerErrorHandling(async (request, response, next) => {
    const errorMessage = request.query.error || 'authentication_failed';
    if (errorMessage === 'user_not_found_please_register') {
        return response.redirect(`${config_1.default?.FRONTEND_URL}/signup?error=please_register_first`);
    }
    else if (errorMessage === 'user_already_exists') {
        return response.redirect(`${config_1.default?.FRONTEND_URL}/login?error=user_exists_please_login`);
    }
    return response.redirect(`${config_1.default?.FRONTEND_URL}/signup?error=${errorMessage}`);
});
const googleAuthRegistrationCallbackController = utilities_1.errorUtilities.withControllerErrorHandling(async (request, response, next) => {
    try {
        const user = request.user;
        if (!user) {
            const errorMessage = request.authInfo?.message || 'registration_failed';
            return response.redirect(`${config_1.default?.FRONTEND_URL}/signup?error=${errorMessage}`);
        }
        // Generate tokens for the new user
        // TODO: Replace with your actual token generation logic
        // const tokens = helperFunctions.generateTokens(user);
        // For now, redirecting with success. You can modify this to send tokens via query params
        // or set them as HTTP-only cookies before redirecting
        // Option 1: Set tokens as HTTP-only cookies (recommended)
        // response.cookie('access_token', tokens.accessToken, { 
        //     httpOnly: true, 
        //     secure: process.env.NODE_ENV === 'production',
        //     maxAge: 24 * 60 * 60 * 1000 // 24 hours
        // });
        // response.cookie('refresh_token', tokens.refreshToken, { 
        //     httpOnly: true, 
        //     secure: process.env.NODE_ENV === 'production',
        //     maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        // });
        return response.redirect(`${config_1.default?.FRONTEND_URL}/google-success`);
    }
    catch (error) {
        next(error);
    }
});
const googleAuthLoginCallbackController = utilities_1.errorUtilities.withControllerErrorHandling(async (request, response, next) => {
    try {
        const user = request.user;
        if (!user) {
            const errorMessage = request.authInfo?.message || 'login_failed';
            return response.redirect(`${config_1.default?.FRONTEND_URL}/login?error=${errorMessage}`);
        }
        // Generate tokens for the existing user
        // TODO: Replace with your actual token generation logic
        // const tokens = helperFunctions.generateTokens(user);
        // Option 1: Set tokens as HTTP-only cookies (recommended)
        // response.cookie('access_token', tokens.accessToken, { 
        //     httpOnly: true, 
        //     secure: process.env.NODE_ENV === 'production',
        //     maxAge: 24 * 60 * 60 * 1000 // 24 hours
        // });
        // response.cookie('refresh_token', tokens.refreshToken, { 
        //     httpOnly: true, 
        //     secure: process.env.NODE_ENV === 'production',
        //     maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        // });
        return response.redirect(`${config_1.default?.FRONTEND_URL}/founders-circle`);
    }
    catch (error) {
        next(error);
    }
});
exports.default = {
    googleAuthFailure,
    googleAuthRegistrationCallbackController,
    googleAuthLoginCallbackController
};
