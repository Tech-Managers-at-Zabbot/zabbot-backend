"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlanType = exports.PaymentGateway = exports.TransactionType = exports.TransactionStatus = void 0;
const sequelize_1 = require("sequelize");
const databases_1 = require("../../../../config/databases");
var TransactionStatus;
(function (TransactionStatus) {
    TransactionStatus["PENDING"] = "pending";
    TransactionStatus["PROCESSING"] = "processing";
    TransactionStatus["TRIALING"] = "trialing";
    TransactionStatus["SUCCESS"] = "success";
    TransactionStatus["FAILED"] = "failed";
    TransactionStatus["REFUNDED"] = "refunded";
    TransactionStatus["CANCELLED"] = "cancelled";
})(TransactionStatus || (exports.TransactionStatus = TransactionStatus = {}));
var TransactionType;
(function (TransactionType) {
    TransactionType["SUBSCRIPTION"] = "subscription";
    TransactionType["ONE_TIME"] = "one_time";
    TransactionType["RENEWAL"] = "renewal";
    TransactionType["REFUND"] = "refund";
})(TransactionType || (exports.TransactionType = TransactionType = {}));
var PaymentGateway;
(function (PaymentGateway) {
    PaymentGateway["STRIPE"] = "stripe";
    PaymentGateway["PAYPAL"] = "paypal";
})(PaymentGateway || (exports.PaymentGateway = PaymentGateway = {}));
var PlanType;
(function (PlanType) {
    PlanType["LIFETIME"] = "lifetime";
    PlanType["ANNUAL"] = "annual";
    PlanType["MONTHLY"] = "monthly";
})(PlanType || (exports.PlanType = PlanType = {}));
class Transactions extends sequelize_1.Model {
}
Transactions.init({
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
    paymentGateway: {
        type: sequelize_1.DataTypes.ENUM(...Object.values(PaymentGateway)),
        allowNull: false,
    },
    gatewayTransactionId: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
        unique: true,
    },
    gatewayCustomerId: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    gatewaySubscriptionId: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    transactionType: {
        type: sequelize_1.DataTypes.ENUM(...Object.values(TransactionType)),
        allowNull: false,
    },
    amount: {
        type: sequelize_1.DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    currency: {
        type: sequelize_1.DataTypes.STRING(3),
        allowNull: false,
        defaultValue: "USD",
    },
    status: {
        type: sequelize_1.DataTypes.ENUM(...Object.values(TransactionStatus)),
        allowNull: false,
        defaultValue: TransactionStatus.PENDING,
    },
    planType: {
        type: sequelize_1.DataTypes.ENUM(...Object.values(PlanType)),
        allowNull: true,
    },
    planId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: true,
        references: {
            model: 'subscription_plans',
            key: 'id',
        },
    },
    paymentMethod: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    last4: {
        type: sequelize_1.DataTypes.STRING(4),
        allowNull: true,
    },
    paymentMethodId: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
        comment: 'Stripe payment_method id saved for a later off-session charge (lifetime trial)',
    },
    scheduledChargeAt: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
        comment: 'when the delayed lifetime trial charge should be attempted',
    },
    chargeAttempts: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
    },
    paidAt: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
    },
    failedAt: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
    },
    refundedAt: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
    },
    cancelledAt: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
    },
    failureReason: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
    },
    failureCode: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    description: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
    },
    metadata: {
        type: sequelize_1.DataTypes.JSON,
        allowNull: true,
    },
}, {
    sequelize: databases_1.users_service_db,
    modelName: "Transactions",
    tableName: "transactions",
    timestamps: true,
    indexes: [
        {
            fields: ['userId'],
        },
        {
            fields: ['gatewayTransactionId'],
        },
        {
            fields: ['status'],
        },
        {
            fields: ['userId', 'status'],
        },
        {
            fields: ['createdAt'],
        },
        {
            fields: ['status', 'scheduledChargeAt'],
        },
    ],
});
exports.default = Transactions;
