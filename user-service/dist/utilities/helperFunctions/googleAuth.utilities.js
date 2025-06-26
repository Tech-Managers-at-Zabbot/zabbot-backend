"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const passport_1 = __importDefault(require("passport"));
const passport_google_oauth20_1 = require("passport-google-oauth20");
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, '../../../../.env') });
const setupGoogleStrategy = (verifyCallback, options) => {
    const strategyOptions = {
        clientID: process.env.GOOGLE_CLIENT_ID || '',
        clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
        callbackURL: process.env.GOOGLE_AUTH_PRODUCTION_URL || '',
        ...options,
    };
    passport_1.default.use(new passport_google_oauth20_1.Strategy(strategyOptions, verifyCallback));
};
exports.default = {
    setupGoogleStrategy,
};
