import { Request, Response, NextFunction } from 'express';
import { errorUtilities, responseUtilities } from '../../../../shared/utilities';
import { StatusCodes } from "../../../../shared/statusCodes/statusCodes.responses";
import config from '../../../../config/config';
import Users from '../../../../shared/entities/user-service-entities/users/users.entities';
import { createHash, randomBytes } from 'crypto';

// OAuth redirects carry a short-lived one-time code, never a JWT or user profile.
const redirectWithExchangeCode = async (response: Response, user: any) => {
    const userId = user?.user?.id;
    if (typeof userId !== "string") throw new Error("Invalid Google login account");
    const randomPart = randomBytes(32).toString("hex");
    const code = `${userId}.${randomPart}`;
    const digest = createHash("sha256").update(code).digest("hex");
    const expiresAt = Date.now() + 60 * 1000;
    await Users.update(
        { accessToken: `${digest}:${expiresAt}` },
        { where: { id: userId } },
    );
    const target = new URL("/google-success", String(config.FRONTEND_URL));
    target.searchParams.set("code", code);
    target.searchParams.set("authType", user.authType === "login" ? "login" : "registration");
    return response.redirect(target.toString());
};

const googleAuthFailure = errorUtilities.withControllerErrorHandling(async (request: Request, response: Response, next: NextFunction) => {
    const errorMessage = request.query.error || 'authentication_failed';

    if (errorMessage === 'user_not_found_please_register') {
        return response.redirect(`${config?.FRONTEND_URL}/signup?error=please_register_first`);
    } else if (errorMessage === 'user_already_exists') {
        return response.redirect(`${config?.FRONTEND_URL}/login?error=user_exists_please_login`)
    } else if(errorMessage === 'user_used_another_login_method'){
        return response.redirect(`${config?.FRONTEND_URL}/login?error=user_used_another_login_method`)
    }

    return response.redirect(`${config?.FRONTEND_URL}/signup?error=${errorMessage}`)
});


const googleAuthRegistrationCallbackController = errorUtilities.withControllerErrorHandling(
    async (request: Request, response: Response, next: NextFunction) => {
        try {
            const user = request.user as any;

            if (!user) {
                const errorMessage = (request as any).authInfo?.message || 'registration_failed';
                return response.redirect(`${config?.FRONTEND_URL}/signup?error=${errorMessage}`)
            }
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

            return await redirectWithExchangeCode(response, user);

            // return response.redirect(`${config?.FRONTEND_URL}/google-success`)

        } catch (error) {
            next(error);
        }
    }
);

const googleAuthLoginCallbackController = errorUtilities.withControllerErrorHandling(
    async (request: Request, response: Response, next: NextFunction) => {
        try {
            const user = request.user as any;

            if (!user) {
                const errorMessage = (request as any).authInfo?.message || 'login_failed';
                return response.redirect(`${config?.FRONTEND_URL}/login?error=${errorMessage}`)
            }
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



            return await redirectWithExchangeCode(response, user);
            // return response.redirect(`${config?.FRONTEND_URL}/founders-circle?success=login_successful`)

        } catch (error) {
            next(error);
        }
    }
);


export default {
    googleAuthFailure,
    googleAuthRegistrationCallbackController,
    googleAuthLoginCallbackController
};
