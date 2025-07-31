"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = __importDefault(require("../../../config/config"));
const dayjs_1 = __importDefault(require("dayjs"));
/**
 * Hash Password:
 * This function hashes a given password using bcrypt with a salt factor of 5.
 * @param {string} password - The password to be hashed.
 * @returns {Promise<string>} - The hashed password.
 * @throws {Error} - Throws an error if there is an issue with hashing the password.
 */
const hashPassword = async (password) => {
    const salt = await bcryptjs_1.default.genSalt(5);
    const passwordHash = await bcryptjs_1.default.hash(password, salt);
    return passwordHash;
};
/**
 * Validate Password:
 * This function compares a given password with a hashed user password using bcrypt.
 * @param {string} password - The password to be validated.
 * @param {string} userPassword - The hashed user password to compare against.
 * @returns {Promise<boolean>} - Returns true if the password matches, otherwise false.
 * @throws {Error} - Throws an error if there is an issue with validating the password.
 */
const bcryptValidate = async (password, userPassword) => {
    return await bcryptjs_1.default.compare(password, userPassword);
};
/**
 * Generate Token:
 * This function generates a JSON Web Token (JWT) with a given payload and an expiration time of 15 hours.
 * @param {string | number | any} payload - The payload to be included in the token.
 * @returns {Promise<string>} - The generated token.
 * @throws {Error} - Throws an error if there is an issue with generating the token.
 */
const generateTokens = async (payload, expiresIn) => {
    return jsonwebtoken_1.default.sign(payload, config_1.default.EDEDUN_APP_SECRET, { expiresIn });
};
const dateFormatter = (dateString) => {
    const year = dateString.getFullYear();
    const month = dateString.getMonth() + 1;
    const day = dateString.getDate();
    const hours = dateString.getHours();
    const minutes = dateString.getMinutes();
    const seconds = dateString.getSeconds();
    const date = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    const time = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    return {
        date,
        time
    };
};
// Function to calculate endTime
const calculateEndTime = (startTime, duration, startDate) => {
    const start = (0, dayjs_1.default)(`${startDate}T${startTime}`);
    const end = start.add(duration, "minute");
    return end.format("HH:mm");
};
const comparePasswords = async (password, userPassword) => {
    return password === userPassword;
};
exports.default = {
    hashPassword,
    bcryptValidate,
    generateTokens,
    dateFormatter,
    calculateEndTime,
    comparePasswords
};
