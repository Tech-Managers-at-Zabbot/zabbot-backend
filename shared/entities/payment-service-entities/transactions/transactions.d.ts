import { Model, Optional } from "sequelize";
export declare enum TransactionStatus {
    PENDING = "pending",
    PROCESSING = "processing",
    TRIALING = "trialing",
    SUCCESS = "success",
    FAILED = "failed",
    REFUNDED = "refunded",
    CANCELLED = "cancelled"
}
export declare enum TransactionType {
    SUBSCRIPTION = "subscription",
    ONE_TIME = "one_time",
    RENEWAL = "renewal",
    REFUND = "refund"
}
export declare enum PaymentGateway {
    STRIPE = "stripe",
    PAYPAL = "paypal"
}
export declare enum PlanType {
    LIFETIME = "lifetime",
    ANNUAL = "annual",
    MONTHLY = "monthly"
}
export interface TransactionAttributes {
    id: string;
    userId: string;
    paymentGateway: PaymentGateway;
    gatewayTransactionId?: string;
    gatewayCustomerId?: string;
    gatewaySubscriptionId?: string;
    transactionType: TransactionType;
    amount: number;
    currency: string;
    status: TransactionStatus;
    planType?: PlanType;
    planId?: string;
    paymentMethod?: string;
    last4?: string;
    paymentMethodId?: string;
    scheduledChargeAt?: Date;
    chargeAttempts?: number;
    paidAt?: Date;
    failedAt?: Date;
    refundedAt?: Date;
    cancelledAt?: Date;
    failureReason?: string;
    failureCode?: string;
    description?: string;
    metadata?: Record<string, any>;
    createdAt?: Date;
    updatedAt?: Date;
}
interface TransactionCreationAttributes extends Optional<TransactionAttributes, "id" | "createdAt" | "updatedAt"> {
}
declare class Transactions extends Model<TransactionAttributes, TransactionCreationAttributes> implements TransactionAttributes {
    id: string;
    userId: string;
    paymentGateway: PaymentGateway;
    gatewayTransactionId?: string;
    gatewayCustomerId?: string;
    gatewaySubscriptionId?: string;
    transactionType: TransactionType;
    amount: number;
    currency: string;
    status: TransactionStatus;
    planType?: PlanType;
    planId?: string;
    paymentMethod?: string;
    last4?: string;
    paymentMethodId?: string;
    scheduledChargeAt?: Date;
    chargeAttempts?: number;
    paidAt?: Date;
    failedAt?: Date;
    refundedAt?: Date;
    cancelledAt?: Date;
    failureReason?: string;
    failureCode?: string;
    description?: string;
    metadata?: Record<string, any>;
    createdAt?: Date;
    updatedAt?: Date;
}
export default Transactions;
