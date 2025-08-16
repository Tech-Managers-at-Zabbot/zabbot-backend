"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const pronunciationFeedback_routes_1 = __importDefault(require("./pronunciationFeedback.routes"));
const rootRouter = express_1.default.Router();
rootRouter.use("/pronunciations", pronunciationFeedback_routes_1.default);
exports.default = rootRouter;
