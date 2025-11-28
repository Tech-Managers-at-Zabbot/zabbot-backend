import { Model, Optional } from "sequelize";
export declare enum TransactionStatus {
    PENDING = "pending",
    SUCCESS = "success",
    FAILED = "failed"
}
export declare enum PlanType {
    LIFETIME = "lifetime",
    ANNUAL = "annual",
    MONTHLY = "monthly"
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
interface TransactionCreationAttributes extends Optional<TransactionAttributes, "id" | "createdAt" | "updatedAt"> {
}
declare class Transactions extends Model<TransactionAttributes, TransactionCreationAttributes> implements TransactionAttributes {
    id: string;
    userId: string;
    planType: PlanType;
    amount: number;
    currency: string;
    status: TransactionStatus;
    createdAt?: Date;
    updatedAt?: Date;
}
export default Transactions;
