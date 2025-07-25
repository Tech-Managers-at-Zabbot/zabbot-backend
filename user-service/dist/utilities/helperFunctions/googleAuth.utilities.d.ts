import { Request } from 'express';
import { Profile, StrategyOptionsWithRequest, VerifyCallback } from 'passport-google-oauth20';
declare const _default: {
    setupGoogleRegisterStrategy: (verifyCallback: (req: Request, accessToken: string, refreshToken: string, profile: Profile, done: VerifyCallback) => void, options?: Partial<StrategyOptionsWithRequest>) => void;
    setupGoogleLoginStrategy: (verifyCallback: (req: Request, accessToken: string, refreshToken: string, profile: Profile, done: VerifyCallback) => void, options?: Partial<StrategyOptionsWithRequest>) => void;
};
export default _default;
