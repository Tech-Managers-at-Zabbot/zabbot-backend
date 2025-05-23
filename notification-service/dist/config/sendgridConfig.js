"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const mail_1 = __importDefault(require("@sendgrid/mail"));
const client_1 = __importDefault(require("@sendgrid/client"));
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, '../../../.env') });
mail_1.default.setApiKey(process.env.SENDGRID_API_KEY);
client_1.default.setApiKey(process.env.SENDGRID_API_KEY);
exports.default = { sendgridMail: mail_1.default, sendgridClient: client_1.default };
