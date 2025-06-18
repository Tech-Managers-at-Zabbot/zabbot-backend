"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const otp_entities_1 = __importDefault(require("../../entities/otp.entities"));
const utilities_1 = require("../../../../shared/utilities");
const otpRepositories = {
    create: async (data, transaction) => {
        try {
            const newOtp = await otp_entities_1.default.create(data, { transaction });
            return newOtp;
        }
        catch (error) {
            console.log(`Create OTP Error: ${error.message}`);
            throw utilities_1.errorUtilities.createError(`Error creating OTP, please try again`, 500);
        }
    },
    getByPK: async (id) => {
        try {
            const otp = await otp_entities_1.default.findByPk(id);
            return otp;
        }
        catch (error) {
            console.log(`Fetch OTP by PK Error: ${error.message}`);
            throw utilities_1.errorUtilities.createError(`Error fetching OTP, please try again`, 500);
        }
    },
    getOne: async (filter, projection = null) => {
        try {
            const otp = await otp_entities_1.default.findOne({
                where: filter,
                attributes: projection,
                raw: true
            });
            if (!otp)
                throw utilities_1.errorUtilities.createError("OTP not found", 404);
            return otp;
        }
        catch (error) {
            console.log(`Fetch OTP Error: ${error.message}`);
            throw utilities_1.errorUtilities.createError(`Error fetching OTP: ${error.message}`, 500);
        }
    },
    getLatestOtp: async (filter, projection = null) => {
        try {
            const otp = await otp_entities_1.default.findOne({
                where: filter,
                attributes: projection,
                order: [['createdAt', 'DESC']],
                raw: true
            });
            if (!otp)
                throw utilities_1.errorUtilities.createError("Latest OTP not found", 404);
            return otp;
        }
        catch (error) {
            console.log(`Fetch Latest OTP Error: ${error.message}`);
            throw utilities_1.errorUtilities.createError(`Error fetching latest OTP: ${error.message}`, 500);
        }
    },
    updateOne: async (filter, update, transaction) => {
        try {
            const otp = await otp_entities_1.default.findOne({ where: filter });
            await otp.update(update, { transaction });
            return otp;
        }
        catch (error) {
            throw utilities_1.errorUtilities.createError(`Error updating OTP: ${error.message}`, 400);
        }
    },
    deleteOne: async (filter) => {
        try {
            const otp = await otp_entities_1.default.findOne({ where: filter });
            if (!otp)
                throw new Error("OTP not found");
            await otp.destroy();
            return otp;
        }
        catch (error) {
            throw utilities_1.errorUtilities.createError(`Error deleting OTP: ${error.message}`, 400);
        }
    },
};
exports.default = otpRepositories;
