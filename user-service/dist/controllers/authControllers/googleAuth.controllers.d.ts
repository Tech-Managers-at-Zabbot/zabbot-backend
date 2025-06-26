export declare const config: {
    DEV_FRONTEND_URL: string | undefined;
    PRODUCTION_FRONTEND_URL: string | undefined;
};
declare const _default: {
    googleAuthCallbackController: (req: import("express").Request, res: import("express").Response, next: import("express").NextFunction) => Promise<void>;
    googleAuthFailure: (req: import("express").Request, res: import("express").Response, next: import("express").NextFunction) => Promise<void>;
};
export default _default;
