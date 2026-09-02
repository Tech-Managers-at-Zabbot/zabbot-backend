"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const uuid_1 = require("uuid");
const databases_1 = require("../../../../config/databases");
class NewsletterSubscription extends sequelize_1.Model {
}
NewsletterSubscription.init({
    id: {
        type: sequelize_1.DataTypes.UUID,
        primaryKey: true,
        allowNull: false,
        defaultValue: () => (0, uuid_1.v4)(),
    },
    email: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true,
        },
    },
}, {
    sequelize: databases_1.users_service_db,
    modelName: "NewsletterSubscription",
    tableName: "newsletter_subscriptions",
    timestamps: true,
});
exports.default = NewsletterSubscription;
