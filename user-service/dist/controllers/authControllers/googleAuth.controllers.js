"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const utilities_1 = require("../../../../shared/utilities");
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, '../../../../.env') });
exports.config = {
    // LOCAL_FOUNDERS_LIST_URL: process.env.LOCAL_FOUNDERS_LIST_URL,
    DEV_FRONTEND_URL: process.env.DEV_FRONTEND_URL,
    PRODUCTION_FRONTEND_URL: process.env.PRODUCTION_FRONTEND_URL,
};
const googleAuthCallbackController = utilities_1.errorUtilities.withControllerErrorHandling(async (request, response, next) => {
    try {
        const user = request.user;
        if (!user) {
            // Check if there's custom error info in the request
            const errorMessage = request.authInfo?.message || 'authentication_failed';
            return response.redirect(`${exports.config?.DEV_FRONTEND_URL}/login?error=${errorMessage}`);
        }
        return response.redirect(`${exports.config?.DEV_FRONTEND_URL}/google-success`);
    }
    catch (error) {
        next(error);
    }
});
// const googleAuthFailure = errorUtilities.withControllerErrorHandling(async (request: Request, response: Response, next: NextFunction) => {
//     // Check if there's custom error info in the request
//          console.log('usering:', request?.authInfo)
//     const errorMessage = (request as any).authInfo?.message || 'authentication_failed';
//     return response.redirect(`${config?.DEV_FRONTEND_URL}/login?error=${errorMessage}`);
// })
const googleAuthFailure = utilities_1.errorUtilities.withControllerErrorHandling(async (request, response, next) => {
    const errorMessage = request.query.error || 'authentication_failed';
    console.log('Auth failure with error:', errorMessage);
    return response.redirect(`${exports.config?.DEV_FRONTEND_URL}/login?error=${errorMessage}`);
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
exports.default = {
    googleAuthCallbackController,
    googleAuthFailure
};
