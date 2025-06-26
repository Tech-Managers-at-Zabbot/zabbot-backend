import { Profile, VerifyCallback } from 'passport-google-oauth20';
import { GoogleStrategyOptions } from 'src/types/users.types';
declare const _default: {
    setupGoogleStrategy: (verifyCallback: (accessToken: string, refreshToken: string, profile: Profile, done: VerifyCallback) => void, options?: Partial<GoogleStrategyOptions>) => void;
};
export default _default;
