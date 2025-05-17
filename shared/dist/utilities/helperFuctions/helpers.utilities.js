"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, '../../../.env') });
const generateToken = (data, expiresIn) => {
    return jsonwebtoken_1.default.sign({ data }, process.env.APP_JWT_SECRET, { expiresIn });
};
const validateToken = (token) => {
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.APP_JWT_SECRET);
        return decoded;
    }
    catch (error) {
        console.error('Token validation error:', error);
        return null;
    }
};
exports.default = {
    generateToken,
    validateToken
};
