"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const passport_1 = __importDefault(require("passport"));
const passport_google_oauth20_1 = require("passport-google-oauth20");
const config_1 = __importDefault(require("../../../../config/config"));
const setupGoogleRegisterStrategy = (verifyCallback, options) => {
    const strategyOptions = {
        clientID: config_1.default?.GOOGLE_CLIENT_ID || "",
        clientSecret: config_1.default?.GOOGLE_CLIENT_SECRET || "",
        callbackURL: `${config_1.default?.GOOGLE_REGISTER_CALLBACK_URL}`,
        passReqToCallback: true,
        ...options,
    };
    passport_1.default.use("google-register", new passport_google_oauth20_1.Strategy(strategyOptions, verifyCallback));
};
const setupGoogleLoginStrategy = (verifyCallback, options) => {
    const strategyOptions = {
        clientID: config_1.default?.GOOGLE_CLIENT_ID || "",
        clientSecret: config_1.default?.GOOGLE_CLIENT_SECRET || "",
        callbackURL: `${config_1.default?.GOOGLE_LOGIN_CALLBACK_URL}`,
        passReqToCallback: true,
        ...options,
    };
    passport_1.default.use("google-login", new passport_google_oauth20_1.Strategy(strategyOptions, verifyCallback));
};
exports.default = {
    setupGoogleRegisterStrategy,
    setupGoogleLoginStrategy,
};
