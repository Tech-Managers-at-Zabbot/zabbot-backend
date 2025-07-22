import { Profile, VerifyCallback } from 'passport-google-oauth20';
import { GoogleStrategyOptions } from '../../types/users.types';
declare const _default: {
    setupGoogleRegisterStrategy: (verifyCallback: (accessToken: string, refreshToken: string, profile: Profile, done: VerifyCallback) => void, options?: Partial<GoogleStrategyOptions>) => void;
    setupGoogleLoginStrategy: (verifyCallback: (accessToken: string, refreshToken: string, profile: Profile, done: VerifyCallback) => void, options?: Partial<GoogleStrategyOptions>) => void;
};
export default _default;
