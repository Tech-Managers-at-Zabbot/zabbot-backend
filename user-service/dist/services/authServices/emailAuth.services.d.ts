export declare const config: {
    NOTIFICATION_SERVICE_ROUTE: string | undefined;
    DEV_PASSWORD_RESET_URL: string | undefined;
    PROD_PASSWORD_RESET_URL: string | undefined;
};
declare const _default: {
    registerUserService: (...args: any[]) => Promise<any>;
    verifyUserAccountService: (...args: any[]) => Promise<any>;
    resendVerificationOtpService: (...args: any[]) => Promise<any>;
    loginUserService: (...args: any[]) => Promise<any>;
    passwordResetRequestService: (...args: any[]) => Promise<any>;
    resetPasswordService: (...args: any[]) => Promise<any>;
};
export default _default;
