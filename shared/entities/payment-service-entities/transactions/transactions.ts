// // models/Transaction.model.ts
// import { DataTypes, Model, Optional } from 'sequelize';
// import { users_service_db } from '../../../../config/databases';

// export enum TransactionStatus {
//   PENDING = 'pending',
//   SUCCEEDED = 'succeeded',
//   FAILED = 'failed',
//   REFUNDED = 'refunded',
//   DISPUTED = 'disputed',
//   CANCELED = 'canceled',
//   PROCESSING = 'processing',
//   EXPIRED = 'expired'
// }

// export enum PaymentMethod {
//   CARD = 'card',
//   PAYPAL = 'paypal',
//   BANK_TRANSFER = 'bank_transfer',
//   WALLET = 'wallet',
//   CRYPTO = 'crypto',
//   OTHER = 'other'
// }

// export enum PaymentGateway {
//   STRIPE = 'stripe',
//   PAYPAL = 'paypal',
// //   RAZORPAY = 'razorpay',
// //   SQUARE = 'square',
//   OTHER = 'other'
// }

// export enum TransactionType {
//   SUBSCRIPTION = 'subscription',
//   ONE_TIME = 'one_time',
//   REFUND = 'refund',
//   DISPUTE = 'dispute'
// }

// export interface TransactionAttributes {
//   id: string;
//   userId: string;

//   // Payment Gateway Information
//   paymentGateway: PaymentGateway;
//   gatewayTransactionId?: string; // Generic transaction ID from gateway
//   gatewaySubscriptionId?: string; // For recurring payments
//   gatewayCustomerId?: string; // Customer ID in the payment gateway
//   gatewayInvoiceId?: string; // Invoice ID if applicable
//   gatewayChargeId?: string; // Charge ID if applicable

//   // Payment Details
//   amount: number;
//   currency: string;
//   status: TransactionStatus;
//   paymentMethod: PaymentMethod;
//   transactionType: TransactionType;

//   // Additional Information
//   description?: string;
//   metadata?: Record<string, any>; // Raw response from payment gateway
//   failureReason?: string;
//   refundedAmount?: number;

//   // Timestamps
//   disputedAt?: Date;
//   refundedAt?: Date;
//   paidAt?: Date;
//   failedAt?: Date;
//   expiresAt?: Date; // For pending transactions that expire
//   createdAt: Date;
//   updatedAt: Date;
//   deletedAt?: Date;
// }

// interface TransactionCreationAttributes extends Optional<TransactionAttributes,
//   'id' | 'createdAt' | 'updatedAt' |
//   'refundedAmount' | 'paidAt' | 'failedAt' | 'expiresAt'
// > {}

// class Transactions extends Model<TransactionAttributes, TransactionCreationAttributes>
//   implements TransactionAttributes {

//   public id!: string;
//   public userId!: string;

//   // Payment Gateway Information
//   public paymentGateway!: PaymentGateway;
//   public gatewayTransactionId?: string;
//   public gatewaySubscriptionId?: string;
//   public gatewayCustomerId?: string;
//   public gatewayInvoiceId?: string;
//   public gatewayChargeId?: string;

//   // Payment Details
//   public amount!: number;
//   public currency!: string;
//   public status!: TransactionStatus;
//   public paymentMethod!: PaymentMethod;
//   public transactionType!: TransactionType;

//   // Additional Information
//   public description?: string;
//   public metadata?: Record<string, any>;
//   public failureReason?: string;
//   public refundedAmount?: number;

//   // Timestamps
//   public disputedAt?: Date;
//   public refundedAt?: Date;
//   public paidAt?: Date;
//   public failedAt?: Date;
//   public expiresAt?: Date;
//   public createdAt!: Date;
//   public updatedAt!: Date;
//   public deletedAt?: Date;
// }

// Transactions.init(
//   {
//     id: {
//       type: DataTypes.UUID,
//       primaryKey: true,
//       defaultValue: DataTypes.UUIDV4,
//     },
//     userId: {
//       type: DataTypes.UUID,
//       allowNull: false,
//       references: {
//         model: 'users',
//         key: 'id',
//       },
//     },

//     // Payment Gateway Information
//     paymentGateway: {
//       type: DataTypes.ENUM(...Object.values(PaymentGateway)),
//       allowNull: false,
//     },
//     gatewayTransactionId: {
//       type: DataTypes.STRING,
//       allowNull: true,
//       comment: 'Generic transaction ID from payment gateway (e.g., pi_xxx for Stripe, PAYID-xxx for PayPal)',
//     },
//     gatewaySubscriptionId: {
//       type: DataTypes.STRING,
//       allowNull: true,
//       comment: 'For recurring payments subscription ID',
//     },
//     gatewayCustomerId: {
//       type: DataTypes.STRING,
//       allowNull: true,
//       comment: 'Customer ID in the payment gateway',
//     },
//     gatewayInvoiceId: {
//       type: DataTypes.STRING,
//       allowNull: true,
//       comment: 'Invoice ID if applicable',
//     },
//     gatewayChargeId: {
//       type: DataTypes.STRING,
//       allowNull: true,
//       comment: 'Charge ID if applicable',
//     },

//     // Payment Details
//     amount: {
//       type: DataTypes.DECIMAL(10, 2),
//       allowNull: false,
//       validate: {
//         min: 0,
//       },
//     },
//     currency: {
//       type: DataTypes.STRING(3),
//       allowNull: false,
//       defaultValue: 'USD',
//       validate: {
//         len: [3, 3],
//       },
//     },
//     status: {
//       type: DataTypes.ENUM(...Object.values(TransactionStatus)),
//       allowNull: false,
//       defaultValue: TransactionStatus.PENDING,
//     },
//     paymentMethod: {
//       type: DataTypes.ENUM(...Object.values(PaymentMethod)),
//       allowNull: false,
//       defaultValue: PaymentMethod.CARD,
//     },
//     transactionType: {
//       type: DataTypes.ENUM(...Object.values(TransactionType)),
//       allowNull: false,
//     },

//     // Additional Information
//     description: {
//       type: DataTypes.TEXT,
//       allowNull: true,
//     },
//     metadata: {
//       type: DataTypes.JSON,
//       allowNull: true,
//       comment: 'Raw response data from payment gateway',
//     },
//     failureReason: {
//       type: DataTypes.TEXT,
//       allowNull: true,
//     },
//     refundedAmount: {
//       type: DataTypes.DECIMAL(10, 2),
//       allowNull: true,
//       defaultValue: 0,
//       validate: {
//         min: 0,
//       },
//     },

//     // Timestamps
//     disputedAt: {
//       type: DataTypes.DATE,
//       allowNull: true,
//     },
//     refundedAt: {
//       type: DataTypes.DATE,
//       allowNull: true,
//     },
//     paidAt: {
//       type: DataTypes.DATE,
//       allowNull: true,
//     },
//     failedAt: {
//       type: DataTypes.DATE,
//       allowNull: true,
//     },
//     expiresAt: {
//       type: DataTypes.DATE,
//       allowNull: true,
//       comment: 'For pending transactions that have expiration',
//     },
//     createdAt: {
//       type: DataTypes.DATE,
//       allowNull: false,
//     },
//     updatedAt: {
//       type: DataTypes.DATE,
//       allowNull: false,
//     },
//     deletedAt: {
//       type: DataTypes.DATE,
//       allowNull: true,
//     },
//   },
//   {
//     sequelize: users_service_db,
//     modelName: 'Transactions',
//     tableName: 'transactions',
//     timestamps: true,
//     paranoid: true,
//     indexes: [
//       {
//         fields: ['userId'],
//       },
//       {
//         fields: ['paymentGateway', 'gatewayTransactionId'],
//         unique: true,
//       },
//       {
//         fields: ['gatewaySubscriptionId'],
//       },
//       {
//         fields: ['status'],
//       },
//       {
//         fields: ['paymentGateway'],
//       },
//       {
//         fields: ['createdAt'],
//       },
//       {
//         fields: ['paymentMethod'],
//       },
//       {
//         fields: ['userId', 'status'],
//       },
//     ],
//   }
// );

// export default Transactions;

import { DataTypes, Model, Optional } from "sequelize";
import { users_service_db } from "../../../../config/databases";

export enum TransactionStatus {
  PENDING = "pending",
  SUCCESS = "success",
  FAILED = "failed",
}

export enum PlanType {
  LIFETIME = "lifetime",
  ANNUAL = "annual",
  MONTHLY = "monthly",
}

export interface TransactionAttributes {
  id: string;
  userId: string;
  planType: PlanType;
  amount: number;
  currency: string;
  status: TransactionStatus;
  createdAt?: Date;
  updatedAt?: Date;
}

interface TransactionCreationAttributes
  extends Optional<
    TransactionAttributes,
    "id" | "createdAt" | "updatedAt"
  > {}

class Transactions
  extends Model<
    TransactionAttributes,
    TransactionCreationAttributes
  >
  implements TransactionAttributes
{
  public id!: string;
  public userId!: string;
  public planType!: PlanType;
  public amount!: number;
  public currency!: string;
  public status!: TransactionStatus;
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
    },
    planType: {
      type: DataTypes.ENUM(...Object.values(PlanType)),
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
  },
  {
    sequelize: users_service_db,
    modelName: "Transactions",
    tableName: "transactions",
    timestamps: true,
  }
);

export default Transactions;
