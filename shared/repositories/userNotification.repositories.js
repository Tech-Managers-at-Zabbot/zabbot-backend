"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const userNotificationSettings_entities_1 = __importDefault(require("../entities/user-service-entities/userNotificationSettings/userNotificationSettings.entities"));
const utilities_1 = require("../utilities");
const userNotificationsRepositories = {
    create: async (data, transaction) => {
        try {
            const newNotificationSettings = await userNotificationSettings_entities_1.default.create(data, {
                transaction,
            });
            return newNotificationSettings;
        }
        catch (error) {
            console.log(`Create notification error: ${error.message}`);
            throw utilities_1.errorUtilities.createError(`Error registering notification, please try again`, 500);
        }
    },
    updateOne: async (filter, update, transaction) => {
        try {
            const notification = await userNotificationSettings_entities_1.default.findOne({
                where: filter,
            });
            await notification.update(update, { transaction });
            return notification;
        }
        catch (error) {
            throw utilities_1.errorUtilities.createError(`Error updating notification: ${error.message}`, 400);
        }
    },
    updateMany: async (filter, update) => {
        try {
            const [affectedRows] = await userNotificationSettings_entities_1.default.update(update, {
                where: filter,
            });
            return { affectedRows };
        }
        catch (error) {
            throw new Error(`Error updating notification: ${error.message}`);
        }
    },
    deleteOne: async (filter) => {
        try {
            const notification = await userNotificationSettings_entities_1.default.findOne({ where: filter });
            if (!notification)
                throw new Error("notification not found");
            await notification.destroy();
            return notification;
        }
        catch (error) {
            throw new Error(`Error deleting notification: ${error.message}`);
        }
    },
    deleteMany: async (filter) => {
        try {
            const affectedRows = await userNotificationSettings_entities_1.default.destroy({ where: filter });
            return { affectedRows };
        }
        catch (error) {
            throw new Error(`Error deleting notification: ${error.message}`);
        }
    },
    getOne: async (filter, projection = null) => {
        try {
            const notification = await userNotificationSettings_entities_1.default.findOne({
                where: filter,
                attributes: projection,
                raw: true,
            });
            return notification;
        }
        catch (error) {
            console.log(`Fetch notification error: ${error.message}`);
            throw utilities_1.errorUtilities.createError(`Error fetching notification, please try again`, 500);
        }
    },
    getAllCount: async () => {
        try {
            const { count } = await userNotificationSettings_entities_1.default.findAndCountAll({});
            return count;
        }
        catch (error) {
            console.log(`Count notification error: ${error.message}`);
        }
    },
    getMany: async (filter, projection, options, order) => {
        try {
            const notifications = await userNotificationSettings_entities_1.default.findAll({
                where: filter,
                attributes: projection,
                ...options,
                order,
                raw: true,
            });
            return notifications;
        }
        catch (error) {
            throw new Error(`Error fetching notification: ${error.message}`);
        }
    },
};
exports.default = userNotificationsRepositories;
