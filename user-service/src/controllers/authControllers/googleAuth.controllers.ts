import { Request, Response, NextFunction } from 'express';
import { errorUtilities, responseUtilities } from '../../../../shared/utilities';
import { StatusCodes } from "../../responses/statusCodes/statusCodes.responses";
import dotenv from "dotenv";
import path from "path";


dotenv.config({ path: path.resolve(__dirname, '../../../../.env') });

export const config = {
    // LOCAL_FOUNDERS_LIST_URL: process.env.LOCAL_FOUNDERS_LIST_URL,
    DEV_FRONTEND_URL: process.env.DEV_FRONTEND_URL,
    PRODUCTION_FRONTEND_URL: process.env.PRODUCTION_FRONTEND_URL,
};

const googleAuthCallbackController = errorUtilities.withControllerErrorHandling(
    async (request: Request, response: Response, next: NextFunction) => {
        try {
            const user = request.user;
            
            if (!user) {
                // Check if there's custom error info in the request
                const errorMessage = (request as any).authInfo?.message || 'authentication_failed';
                return response.redirect(`${config?.DEV_FRONTEND_URL}/login?error=${errorMessage}`);
            }

            return response.redirect(`${config?.DEV_FRONTEND_URL}/google-success`);

        } catch (error) {
            next(error);
        }
    }
);

// const googleAuthFailure = errorUtilities.withControllerErrorHandling(async (request: Request, response: Response, next: NextFunction) => {
//     // Check if there's custom error info in the request
//          console.log('usering:', request?.authInfo)
//     const errorMessage = (request as any).authInfo?.message || 'authentication_failed';
//     return response.redirect(`${config?.DEV_FRONTEND_URL}/login?error=${errorMessage}`);
// })

const googleAuthFailure = errorUtilities.withControllerErrorHandling(async (request: Request, response: Response, next: NextFunction) => {
    const errorMessage = request.query.error || 'authentication_failed';
    console.log('Auth failure with error:', errorMessage);
    return response.redirect(`${config?.DEV_FRONTEND_URL}/login?error=${errorMessage}`);
});


// const googleAuthCallbackController = errorUtilities.withControllerErrorHandling(
//   async (req: Request, res: Response, next: NextFunction) => {
//     try {
//       const user = req.user;

//       if (!user) {
//         // Redirect to frontend with error
//         return res.redirect(`${process.env.FRONTEND_URL}/login?error=auth_failed`);
//       }

//       // TODO: Generate your own access/refresh tokens here
//       // const { accessToken, refreshToken } = authTokenUtils.generateTokens(user);

//       // Redirect to frontend with user data or success flag
//       // Option 1: Include user data in URL (not recommended for sensitive data)
//       const userData = encodeURIComponent(JSON.stringify({
//         id: user.id,
//         email: user.email,
//         firstName: user.firstName,
//         lastName: user.lastName
//       }));

//       return res.redirect(`${process.env.FRONTEND_URL}/auth/google/success?user=${userData}`);

//       // Option 2: Set HTTP-only cookies and redirect
//       // res.cookie('access_token', accessToken, { httpOnly: true, secure: true });
//       // res.cookie('user_id', user.id, { httpOnly: true, secure: true });
//       // return res.redirect(`${process.env.FRONTEND_URL}/dashboard`);

//     } catch (error) {
//       return res.redirect(`${process.env.FRONTEND_URL}/login?error=server_error`);
//     }
//   }
// );

export default {
    googleAuthCallbackController,
    googleAuthFailure
};
