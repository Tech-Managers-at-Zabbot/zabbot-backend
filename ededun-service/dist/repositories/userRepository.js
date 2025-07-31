"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const usersModel_1 = __importDefault(require("../models/users/usersModel"));
const userRepositories = {
    create: async (data, transaction) => {
        try {
            const newUser = await usersModel_1.default.create(data, { transaction });
            return newUser;
        }
        catch (error) {
            throw new Error(`Error creating User: ${error.message}`);
        }
    },
    updateOne: async (filter, update, transaction) => {
        try {
            const user = await usersModel_1.default.findOne({ where: filter });
            await user.update(update, { transaction });
            return user;
        }
        catch (error) {
            throw new Error(`Error updating User: ${error.message}`);
        }
    },
    updateMany: async (filter, update) => {
        try {
            const [affectedRows] = await usersModel_1.default.update(update, { where: filter });
            return { affectedRows };
        }
        catch (error) {
            throw new Error(`Error updating Users: ${error.message}`);
        }
    },
    deleteOne: async (filter) => {
        try {
            const user = await usersModel_1.default.findOne({ where: filter });
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
            const affectedRows = await usersModel_1.default.destroy({ where: filter });
            return { affectedRows };
        }
        catch (error) {
            throw new Error(`Error deleting Users: ${error.message}`);
        }
    },
    getOne: async (filter, projection = null) => {
        try {
            const user = await usersModel_1.default.findOne({
                where: filter,
                attributes: projection
            });
            return user;
        }
        catch (error) {
            throw new Error(`Error fetching User: ${error.message}`);
        }
    },
    getMany: async (filter, projection, options, order) => {
        try {
            const users = await usersModel_1.default.findAll({
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
                phone: userData.phone,
                refreshToken: userData.refreshToken,
                id: userData.id
            };
        }
        catch (error) {
            throw new Error(`Error fetching User(s): ${error.message}`);
        }
    },
};
exports.default = {
    userRepositories,
};
