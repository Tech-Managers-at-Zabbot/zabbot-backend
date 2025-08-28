"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_merge_1 = __importDefault(require("lodash.merge"));
const dotenv_flow_1 = __importDefault(require("dotenv-flow"));
const fs_1 = __importDefault(require("fs"));
const stage = process.env.NODE_ENV || 'development';
if (stage === 'development') {
    dotenv_flow_1.default.config({
        files: ['.env.development'],
        path: process.cwd()
    });
}
else if (stage === 'staging') {
    if (fs_1.default.existsSync('.env.staging')) {
        dotenv_flow_1.default.config({
            files: ['.env.staging'],
            path: process.cwd()
        });
    }
    else {
        dotenv_flow_1.default.config({
            files: ['.env'],
            path: process.cwd()
        });
    }
}
else if (stage === 'production') {
    if (fs_1.default.existsSync('.env.production')) {
        dotenv_flow_1.default.config({
            files: ['.env.production'],
            path: process.cwd()
        });
    }
    else {
        dotenv_flow_1.default.config({
            files: ['.env'],
            path: process.cwd()
        });
    }
}
else if (stage === 'staging:start') {
    dotenv_flow_1.default.config({
        files: ['.env'],
        path: process.cwd()
    });
}
let config;
if (stage === "development") {
    config = require("./development").default;
}
else if (stage === "production") {
    config = require("./production").default;
}
else if (stage === "staging" || stage === 'staging:start') {
    config = require("./staging").default;
}
else {
    throw new Error(`Invalid NODE_ENV: ${stage}`);
}
exports.default = (0, lodash_merge_1.default)({
    stage
}, config);
