"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userController = exports.adminControllers = exports.authController = void 0;
const authController_1 = __importDefault(require("./authControllers/authController"));
exports.authController = authController_1.default;
const adminControllers_1 = __importDefault(require("./adminControllers/adminControllers"));
exports.adminControllers = adminControllers_1.default;
const userController_1 = __importDefault(require("./userControllers/userController"));
exports.userController = userController_1.default;
