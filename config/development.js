"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const { DEV_DATABASE_URL } = process.env;
console.log('Running in development mode');
exports.default = {
    DB_URL: DEV_DATABASE_URL
};
