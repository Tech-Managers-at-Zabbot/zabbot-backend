"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_merge_1 = __importDefault(require("lodash.merge"));
const dotenv_flow_1 = __importDefault(require("dotenv-flow"));
const stage = process.env.NODE_ENV || 'development';
switch (stage) {
    case 'development':
        dotenv_flow_1.default.config({
            files: ['.env.development'],
            path: process.cwd()
        });
        break;
    case 'staging':
        dotenv_flow_1.default.config({
            files: ['.env.staging'],
            path: process.cwd()
        });
        break;
    case 'production':
        dotenv_flow_1.default.config({
            files: ['.env.production'],
            path: process.cwd()
        });
        break;
    default:
        throw new Error(`Invalid NODE_ENV: ${stage}`);
}
let config;
if (stage === "development") {
    config = require("./development").default;
}
else if (stage === "production") {
    config = require("./production").default;
}
else if (stage === "staging") {
    config = require("./staging").default;
}
else {
    throw new Error(`Invalid NODE_ENV: ${stage}`);
}
exports.default = (0, lodash_merge_1.default)({
    stage
}, config);
