import { Profile, VerifyCallback } from 'passport-google-oauth20';
declare const _default: {
    googleOAuthRegister: (accessToken: string, refreshToken: string, profile: Profile, done: VerifyCallback) => Promise<void>;
    googleOAuthLogin: (accessToken: string, refreshToken: string, profile: Profile, done: VerifyCallback) => Promise<void>;
};
export default _default;
