import dotenv from 'dotenv';
import { errorUtilities } from '../../../../shared/utilities';
import path from 'path';
import passport from 'passport';
import { Strategy as GoogleStrategy, Profile, VerifyCallback } from 'passport-google-oauth20';
import { GoogleStrategyOptions } from 'src/types/users.types';


dotenv.config({ path: path.resolve(__dirname, '../../../../.env') });


const setupGoogleStrategy = (
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
        callbackURL: process.env.GOOGLE_AUTH_PRODUCTION_URL || '',
        ...options,
    };

    passport.use(new GoogleStrategy(strategyOptions, verifyCallback));
};

export default {
    setupGoogleStrategy,
};