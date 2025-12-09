import { Model } from 'sequelize';
export declare enum PlanType {
    LIFETIME = "lifetime",
    ANNUAL = "annual",
    MONTHLY = "monthly"
}
export interface SubscriptionPlanAttributes {
    id: string;
    planType: PlanType;
    price: number;
    currency: string;
    billingCycleMonths: number;
    features?: Record<string, any>;
    createdAt?: Date;
    updatedAt?: Date;
}
declare class SubscriptionPlan extends Model<SubscriptionPlanAttributes> implements SubscriptionPlanAttributes {
    id: string;
    planType: PlanType;
    price: number;
    currency: string;
    billingCycleMonths: number;
    features?: Record<string, any>;
    createdAt?: Date;
    updatedAt?: Date;
}
export default SubscriptionPlan;
