"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.googleAuthServices = exports.emailAuthServices = void 0;
const emailAuth_services_1 = __importDefault(require("./authServices/emailAuth.services"));
exports.emailAuthServices = emailAuth_services_1.default;
const googleAuth_services_1 = __importDefault(require("./authServices/googleAuth.services"));
exports.googleAuthServices = googleAuth_services_1.default;
