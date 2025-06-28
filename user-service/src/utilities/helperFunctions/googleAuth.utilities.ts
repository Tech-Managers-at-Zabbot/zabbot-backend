import dotenv from 'dotenv';
import { errorUtilities } from '../../../../shared/utilities';
import path from 'path';
import passport from 'passport';
import { Strategy as GoogleStrategy, Profile, VerifyCallback } from 'passport-google-oauth20';
import { GoogleStrategyOptions } from 'src/types/users.types';
import config from '../../../../config/config';
dotenv.config({ path: path.resolve(__dirname, '../../../../.env') });


const setupGoogleRegisterStrategy = (
    verifyCallback: (
        accessToken: string,
        refreshToken: string,
        profile: Profile,
        done: VerifyCallback
    ) => void,
    options?: Partial<GoogleStrategyOptions>
) => {
    const strategyOptions: GoogleStrategyOptions = {
        clientID: process.env.GOOGLE_CLIENT_ID || '',
        clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
        callbackURL: `${config?.GOOGLE_REGISTER_CALLBACK_URL}`,
        ...options,
    };

    passport.use('google-register', new GoogleStrategy(strategyOptions, verifyCallback));
};

const setupGoogleLoginStrategy = (
    verifyCallback: (
        accessToken: string,
        refreshToken: string,
        profile: Profile,
        done: VerifyCallback
    ) => void,
    options?: Partial<GoogleStrategyOptions>
) => {
    const strategyOptions: GoogleStrategyOptions = {
        clientID: process.env.GOOGLE_CLIENT_ID || '',
        clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
        callbackURL: `${config?.GOOGLE_LOGIN_CALLBACK_URL}`,
        ...options,
    };

    passport.use('google-login', new GoogleStrategy(strategyOptions, verifyCallback));
};

export default {
    setupGoogleRegisterStrategy,
    setupGoogleLoginStrategy,
};