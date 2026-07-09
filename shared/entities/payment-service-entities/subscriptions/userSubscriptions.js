"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionStatus = void 0;
const sequelize_1 = require("sequelize");
const databases_1 = require("../../../../config/databases");
var SubscriptionStatus;
(function (SubscriptionStatus) {
    SubscriptionStatus["ACTIVE"] = "active";
    SubscriptionStatus["CANCELLED"] = "cancelled";
    SubscriptionStatus["CANCELLING"] = "cancelling";
    SubscriptionStatus["EXPIRED"] = "expired";
    SubscriptionStatus["PAUSED"] = "paused";
    SubscriptionStatus["FAILED"] = "failed";
})(SubscriptionStatus || (exports.SubscriptionStatus = SubscriptionStatus = {}));
class UserSubscription extends sequelize_1.Model {
}
UserSubscription.init({
    id: {
        type: sequelize_1.DataTypes.UUID,
        primaryKey: true,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
    },
    userId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id',
        },
    },
    planId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'subscription_plans',
            key: 'id',
        },
    },
    status: {
        type: sequelize_1.DataTypes.ENUM(...Object.values(SubscriptionStatus)),
        allowNull: false,
        defaultValue: SubscriptionStatus.ACTIVE,
    },
    gatewaySubscriptionId: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
        comment: 'Stripe or other payment gateway subscription ID',
    },
    startDate: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
    },
    endDate: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
        comment: 'null for lifetime subscriptions',
    },
    renewalDate: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
        comment: 'next billing/renewal date for recurring plans',
    },
    trialEndsAt: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
        comment: 'when the 7-day free trial ends; null once converted to a paid period',
    },
    cancelledAt: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
    },
    cancellationReason: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
    }
}, {
    sequelize: databases_1.users_service_db,
    modelName: 'UserSubscription',
    tableName: 'user_subscriptions',
    timestamps: true,
    indexes: [
        {
            fields: ['userId'],
        },
        {
            fields: ['planId'],
        },
        {
            fields: ['userId', 'status'],
        },
        {
            fields: ['renewalDate'],
        },
        {
            fields: ['gatewaySubscriptionId'],
        },
    ],
});
exports.default = UserSubscription;
