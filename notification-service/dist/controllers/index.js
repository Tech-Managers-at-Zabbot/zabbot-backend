"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userAuthNotifications = exports.emailControllers = void 0;
const foundersListControllers_1 = __importDefault(require("./foundersListControllers"));
exports.emailControllers = foundersListControllers_1.default;
const userNotifications_1 = __importDefault(require("./userNotifications"));
exports.userAuthNotifications = userNotifications_1.default;
