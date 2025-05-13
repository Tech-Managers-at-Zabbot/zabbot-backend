"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const mailchimp_marketing_1 = __importDefault(require("@mailchimp/mailchimp_marketing"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, '../../../.env') });
exports.config = {
    MAILCHIMP_API_KEY: process.env.MAILCHIMP_API_KEY,
    MAILCHIMP_SERVER_PREFIX: process.env.MAILCHIMP_SERVER_PREFIX,
};
mailchimp_marketing_1.default.setConfig({
    apiKey: exports.config.MAILCHIMP_API_KEY,
    server: exports.config.MAILCHIMP_SERVER_PREFIX
});
exports.default = mailchimp_marketing_1.default;
