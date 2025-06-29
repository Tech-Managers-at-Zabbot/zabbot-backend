"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = __importDefault(require("../../../config/config"));
const generateToken = (data, expiresIn) => {
    return jsonwebtoken_1.default.sign({ data }, config_1.default.APP_JWT_SECRET, { expiresIn });
};
const validateToken = (token) => {
    try {
        const decoded = jsonwebtoken_1.default.verify(token, config_1.default.APP_JWT_SECRET);
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
