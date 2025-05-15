"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendgridMailServices = exports.mailChimpServices = void 0;
const mailChimpServices_1 = __importDefault(require("./mailChimpServices"));
exports.mailChimpServices = mailChimpServices_1.default;
const sendgridServices_1 = __importDefault(require("./sendgridServices"));
exports.sendgridMailServices = sendgridServices_1.default;
