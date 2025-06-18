"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const foundingListRoutes_1 = __importDefault(require("./foundingListRoutes/foundingListRoutes"));
const authNotification_1 = __importDefault(require("./authNotificationRoutes/authNotification"));
const rootRouter = express_1.default.Router();
rootRouter.use('/founding-list', foundingListRoutes_1.default);
rootRouter.use('/auth-notification', authNotification_1.default);
exports.default = rootRouter;
