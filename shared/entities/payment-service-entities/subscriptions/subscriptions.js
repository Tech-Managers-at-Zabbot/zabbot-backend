"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlanType = void 0;
const sequelize_1 = require("sequelize");
const databases_1 = require("../../../../config/databases");
var PlanType;
(function (PlanType) {
    PlanType["LIFETIME"] = "lifetime";
    PlanType["ANNUAL"] = "annual";
    PlanType["MONTHLY"] = "monthly";
})(PlanType || (exports.PlanType = PlanType = {}));
class SubscriptionPlan extends sequelize_1.Model {
}
SubscriptionPlan.init({
    id: {
        type: sequelize_1.DataTypes.UUID,
        primaryKey: true,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
    },
    planType: {
        type: sequelize_1.DataTypes.ENUM(...Object.values(PlanType)),
        allowNull: false,
        unique: true,
    },
    price: {
        type: sequelize_1.DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: { min: 0 },
    },
    currency: {
        type: sequelize_1.DataTypes.STRING(3),
        allowNull: false,
        defaultValue: 'USD',
    },
    billingCycleMonths: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
        comment: 'null for lifetime, 1 for monthly, 12 for annual',
    },
    features: {
        type: sequelize_1.DataTypes.JSON,
        allowNull: true,
    },
}, {
    sequelize: databases_1.users_service_db,
    modelName: 'SubscriptionPlan',
    tableName: 'subscription_plans',
    timestamps: true,
});
exports.default = SubscriptionPlan;
