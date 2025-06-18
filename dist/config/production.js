"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const { USERS_SERVICE_PRODUCTION_DB, USERS_SERVICE_DEV_DB, FOUNDERS_LIST_PRODUCTION_DB } = process.env;
console.log('Running in production mode');
exports.default = {
    FOUNDERS_LIST_DB: FOUNDERS_LIST_PRODUCTION_DB,
    USERS_SERVICE_DB: USERS_SERVICE_DEV_DB
};
