"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.googleAuthControllers = exports.emailAuthControllers = void 0;
const emailAuth_controllers_1 = __importDefault(require("./authControllers/emailAuth.controllers"));
exports.emailAuthControllers = emailAuth_controllers_1.default;
const googleAuth_controllers_1 = __importDefault(require("./authControllers/googleAuth.controllers"));
exports.googleAuthControllers = googleAuth_controllers_1.default;
