"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const users_entities_1 = __importDefault(require("../../entities/users.entities"));
const utilities_1 = require("../../../../shared/utilities");
const userRepositories = {
    create: async (data, transaction) => {
        try {
            const newUser = await users_entities_1.default.create(data, { transaction });
            return newUser;
        }
        catch (error) {
            console.log(`Create User Error: ${error.message}`);
            throw utilities_1.errorUtilities.createError(`Error registering user, please try again`, 500);
        }
    },
    getByPK: async (id) => {
        try {
            const user = await users_entities_1.default.findByPk(id);
            return user;
        }
        catch (error) {
            console.log(`Fetch User by Error: ${error.message}`);
            throw utilities_1.errorUtilities.createError(`Error Fetching user, please try again`, 500);
        }
    },
    updateOne: async (filter, update, transaction) => {
        try {
            const user = await users_entities_1.default.findOne({ where: filter });
            await user.update(update, { transaction });
            return user;
        }
        catch (error) {
            throw utilities_1.errorUtilities.createError(`Error updating User: ${error.message}`, 400);
        }
    },
    updateMany: async (filter, update) => {
        try {
            const [affectedRows] = await users_entities_1.default.update(update, { where: filter });
            return { affectedRows };
        }
        catch (error) {
            throw new Error(`Error updating Users: ${error.message}`);
        }
    },
    deleteOne: async (filter) => {
        try {
            const user = await users_entities_1.default.findOne({ where: filter });
            if (!user)
                throw new Error("User not found");
            await user.destroy();
            return user;
        }
        catch (error) {
            throw new Error(`Error deleting User: ${error.message}`);
        }
    },
    deleteMany: async (filter) => {
        try {
            const affectedRows = await users_entities_1.default.destroy({ where: filter });
            return { affectedRows };
        }
        catch (error) {
            throw new Error(`Error deleting Users: ${error.message}`);
        }
    },
    getOne: async (filter, projection = null) => {
        try {
            const user = await users_entities_1.default.findOne({
                where: filter,
                attributes: projection,
                raw: true
            });
            return user;
        }
        catch (error) {
            console.log(`Fetch User Error: ${error.message}`);
            throw utilities_1.errorUtilities.createError(`Error fetching user, please try again`, 500);
        }
    },
    getMany: async (filter, projection, options, order) => {
        try {
            const users = await users_entities_1.default.findAll({
                where: filter,
                attributes: projection,
                ...options,
                order
            });
            return users;
        }
        catch (error) {
            throw new Error(`Error fetching Users: ${error.message}`);
        }
    },
    extractUserDetails: async (userData) => {
        try {
            return {
                email: userData.email,
                firstName: userData.firstName,
                lastName: userData.lastName,
                role: userData.role,
                id: userData.id,
                isFirstTimeLogin: userData.isFirstTimeLogin,
                isVerified: userData.isVerified,
                isActive: userData.isActive,
                isBlocked: userData.isBlocked,
                verifiedAt: userData.verifiedAt,
                registerMethod: userData.registerMethod,
                country: userData.country,
                phoneNumber: userData.phoneNumber,
                deletedAt: userData.deletedAt,
                profilePicture: userData.profilePicture,
                bio: userData.bio,
                dateOfBirth: userData.dateOfBirth,
                address: userData.address,
                socialLinks: userData.socialLinks,
                preferences: userData.preferences,
                lastLoginAt: userData.lastLoginAt,
                lastPasswordChangeAt: userData.lastPasswordChangeAt,
                twoFactorEnabled: userData.twoFactorEnabled,
                securityQuestions: userData.securityQuestions,
            };
        }
        catch (error) {
            throw new Error(`Error fetching User(s): ${error.message}`);
        }
    },
};
exports.default = userRepositories;
