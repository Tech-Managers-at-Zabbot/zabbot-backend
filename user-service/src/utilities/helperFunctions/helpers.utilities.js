"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const utilities_1 = require("../../../../shared/utilities");
const path_1 = __importDefault(require("path"));
const crypto_1 = __importDefault(require("crypto"));
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, '../../../../.env') });
const hashPassword = async (password) => {
    const saltRounds = 10;
    const salt = await bcryptjs_1.default.genSalt(saltRounds);
    const hash = await bcryptjs_1.default.hash(password, salt);
    return hash;
};
const generateToken = (data) => {
    return jsonwebtoken_1.default.sign(data.data, `${process.env.APP_JWT_SECRET}`, { expiresIn: `${data.expires}` });
};
const convertToDDMMYY = (isoDateString) => {
    const date = new Date(isoDateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear().toString().slice(-2);
    return `${day}-${month}-${year}`;
};
const convertToISODateString = (regularDateString) => {
    const dateParts = regularDateString.split('/');
    if (dateParts.length === 3) {
        const day = dateParts[0].padStart(2, '0');
        const month = dateParts[1].padStart(2, '0');
        const year = dateParts[2];
        const date = new Date(`${year}-${month}-${day}`);
        if (!isNaN(date.getTime())) {
            return date.toISOString().slice(0, 10);
        }
    }
    return null;
};
const validateToken = (token) => {
    if (!token) {
        throw utilities_1.errorUtilities.createError('Token is required', 400);
    }
    if (!process.env.APP_JWT_SECRET) {
        throw utilities_1.errorUtilities.createError('JWT secret is not configured', 400);
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.APP_JWT_SECRET);
        return decoded;
    }
    catch (error) {
        if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
            throw utilities_1.errorUtilities.createError('Token has expired, please request for another verification link', 400);
        }
        if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            console.error(`Invalid token: ${error.message}`);
            throw utilities_1.errorUtilities.createError(`Invalid token, Please request another verification link`, 400);
        }
        if (error instanceof jsonwebtoken_1.default.NotBeforeError) {
            throw utilities_1.errorUtilities.createError('Token is not active yet. Please request for another verification link', 400);
        }
        throw utilities_1.errorUtilities.createError(`Token validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`, 400);
    }
};
const comparePasswords = async (password, hashedPassword) => {
    try {
        const isMatch = await bcryptjs_1.default.compare(password, hashedPassword);
        return isMatch;
    }
    catch (error) {
        console.error(`Error validating password: ${error}`);
        throw utilities_1.errorUtilities.createError('Error validating password', 500);
    }
};
/**
 * Generates a cryptographically secure OTP of specified length
 * @param length - The length of the OTP (default: 6)
 * @returns A string containing random digits
 */
const generateOtp = (length = 4) => {
    if (length < 1) {
        throw utilities_1.errorUtilities.createError('OTP length must be at least 1', 400);
    }
    if (length > 20) {
        throw utilities_1.errorUtilities.createError('OTP length should not exceed 20 for practical purposes', 400);
    }
    let otp = '';
    for (let i = 0; i < length; i++) {
        const digit = crypto_1.default.randomInt(0, 10);
        otp += digit.toString();
    }
    return otp;
};
const generateOtpWithOptions = (options = {}) => {
    const { length = 4, excludeZero = false, prefix = '', suffix = '' } = options;
    if (length < 1) {
        throw new Error('OTP length must be at least 1');
    }
    let otp = '';
    for (let i = 0; i < length; i++) {
        let digit;
        if (excludeZero) {
            digit = crypto_1.default.randomInt(1, 10);
        }
        else {
            digit = crypto_1.default.randomInt(0, 10);
        }
        otp += digit.toString();
    }
    return `${prefix}${otp}${suffix}`;
};
exports.default = {
    generateToken,
    validateToken,
    hashPassword,
    convertToDDMMYY,
    convertToISODateString,
    comparePasswords,
    generateOtp,
    generateOtpWithOptions
};
