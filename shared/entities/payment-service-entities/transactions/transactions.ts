import { DataTypes, Model, Optional } from "sequelize";
import { users_service_db } from "../../../../config/databases";

export enum TransactionStatus {
  PENDING = "pending",
  PROCESSING = "processing",
  TRIALING = "trialing",
  SUCCESS = "success",
  FAILED = "failed",
  REFUNDED = "refunded",
  CANCELLED = "cancelled",
}

export enum TransactionType {
  SUBSCRIPTION = "subscription",
  ONE_TIME = "one_time",
  RENEWAL = "renewal",
  REFUND = "refund",
}

export enum PaymentGateway {
  STRIPE = "stripe",
  PAYPAL = "paypal",
}

export enum PlanType {
  LIFETIME = "lifetime",
  ANNUAL = "annual",
  MONTHLY = "monthly",
}

export interface TransactionAttributes {
  id: string;
  userId: string;
  
  // Payment Gateway Info
  paymentGateway: PaymentGateway;
  gatewayTransactionId?: string; // payment_intent.id or charge.id
  gatewayCustomerId?: string; // stripe customer id
  gatewaySubscriptionId?: string; // stripe subscription id
  
  // Transaction Details
  transactionType: TransactionType;
  amount: number;
  currency: string;
  status: TransactionStatus;
  
  // Subscription Related (optional)
  planType?: PlanType;
  planId?: string;
  
  // Payment Details
  paymentMethod?: string; // card, bank_transfer, etc.
  last4?: string; // last 4 digits of card
  paymentMethodId?: string; // Stripe payment_method id saved for a later off-session charge (lifetime trial)
  scheduledChargeAt?: Date; // when the delayed lifetime trial charge should be attempted
  chargeAttempts?: number; // number of delayed-charge attempts made so far
  
  // Status Timestamps
  paidAt?: Date;
  failedAt?: Date;
  refundedAt?: Date;
  cancelledAt?: Date;
  
  // Additional Info
  failureReason?: string;
  failureCode?: string;
  description?: string;
  metadata?: Record<string, any>;
  
  createdAt?: Date;
  updatedAt?: Date;
}

interface TransactionCreationAttributes
  extends Optional<
    TransactionAttributes,
    "id" | "createdAt" | "updatedAt"
  > {}

class Transactions
  extends Model<TransactionAttributes, TransactionCreationAttributes>
  implements TransactionAttributes
{
  public id!: string;
  public userId!: string;
  
  public paymentGateway!: PaymentGateway;
  public gatewayTransactionId?: string;
  public gatewayCustomerId?: string;
  public gatewaySubscriptionId?: string;
  
  public transactionType!: TransactionType;
  public amount!: number;
  public currency!: string;
  public status!: TransactionStatus;
  
  public planType?: PlanType;
  public planId?: string;
  
  public paymentMethod?: string;
  public last4?: string;
  public paymentMethodId?: string;
  public scheduledChargeAt?: Date;
  public chargeAttempts?: number;
  
  public paidAt?: Date;
  public failedAt?: Date;
  public refundedAt?: Date;
  public cancelledAt?: Date;
  
  public failureReason?: string;
  public failureCode?: string;
  public description?: string;
  public metadata?: Record<string, any>;
  
  public createdAt?: Date;
  public updatedAt?: Date;
}

Transactions.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    paymentGateway: {
      type: DataTypes.ENUM(...Object.values(PaymentGateway)),
      allowNull: false,
    },
    gatewayTransactionId: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
    },
    gatewayCustomerId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    gatewaySubscriptionId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    transactionType: {
      type: DataTypes.ENUM(...Object.values(TransactionType)),
      allowNull: false,
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    currency: {
      type: DataTypes.STRING(3),
      allowNull: false,
      defaultValue: "USD",
    },
    status: {
      type: DataTypes.ENUM(...Object.values(TransactionStatus)),
      allowNull: false,
      defaultValue: TransactionStatus.PENDING,
    },
    planType: {
      type: DataTypes.ENUM(...Object.values(PlanType)),
      allowNull: true,
    },
    planId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'subscription_plans',
        key: 'id',
      },
    },
    paymentMethod: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    last4: {
      type: DataTypes.STRING(4),
      allowNull: true,
    },
    paymentMethodId: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Stripe payment_method id saved for a later off-session charge (lifetime trial)',
    },
    scheduledChargeAt: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'when the delayed lifetime trial charge should be attempted',
    },
    chargeAttempts: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    paidAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    failedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    refundedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    cancelledAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    failureReason: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    failureCode: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    metadata: {
      type: DataTypes.JSON,
      allowNull: true,
    },
  },
  {
    sequelize: users_service_db,
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
  }
);

export default Transactions;