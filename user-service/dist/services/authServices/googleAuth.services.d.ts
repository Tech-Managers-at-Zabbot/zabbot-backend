import { Profile, VerifyCallback } from 'passport-google-oauth20';
import { Request } from 'express';
declare const _default: {
    googleOAuthRegister: (request: Request, accessToken: string, refreshToken: string, profile: Profile, done: VerifyCallback) => Promise<void>;
    googleOAuthLogin: (request: Request, accessToken: string, refreshToken: string, profile: Profile, done: VerifyCallback) => Promise<void>;
};
export default _default;
