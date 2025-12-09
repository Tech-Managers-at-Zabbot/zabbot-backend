import { Model, Optional } from 'sequelize';
export declare enum SubscriptionStatus {
    ACTIVE = "active",
    CANCELLED = "cancelled",
    CANCELLING = "cancelling",
    EXPIRED = "expired",
    PAUSED = "paused",
    FAILED = "failed"
}
export interface UserSubscriptionAttributes {
    id: string;
    userId: string;
    planId: string;
    status: SubscriptionStatus;
    gatewaySubscriptionId?: string;
    startDate: Date;
    endDate?: Date;
    renewalDate?: Date;
    cancelledAt?: Date;
    cancellationReason?: string;
    createdAt?: Date;
    updatedAt?: Date;
}
interface UserSubscriptionCreationAttributes extends Optional<UserSubscriptionAttributes, 'id' | 'createdAt' | 'updatedAt'> {
}
declare class UserSubscription extends Model<UserSubscriptionAttributes, UserSubscriptionCreationAttributes> implements UserSubscriptionAttributes {
    id: string;
    userId: string;
    planId: string;
    status: SubscriptionStatus;
    gatewaySubscriptionId?: string;
    startDate: Date;
    endDate?: Date;
    renewalDate?: Date;
    cancelledAt?: Date;
    cancellationReason?: string;
    createdAt?: Date;
    updatedAt?: Date;
}
export default UserSubscription;
