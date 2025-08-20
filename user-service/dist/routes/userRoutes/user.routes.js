"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const controllers_1 = require("../../controllers");
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
router.get('/single-user/:userId', controllers_1.usersControllers.getSingleUser);
router.get('/all-user-count', controllers_1.usersControllers.getAllUsersCount);
exports.default = router;
