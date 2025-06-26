import { Profile, VerifyCallback } from 'passport-google-oauth20';
export declare const config: {
    LOCAL_FOUNDERS_LIST_URL: string | undefined;
    NOTIFICATION_SERVICE_ROUTE: string | undefined;
};
declare const _default: {
    googleOAuthVerify: (accessToken: string, refreshToken: string, profile: Profile, done: VerifyCallback) => Promise<void>;
};
export default _default;
