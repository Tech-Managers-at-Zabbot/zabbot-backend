import { DataTypes, Model, Optional } from 'sequelize';
import { users_service_db } from '../../../../config/databases';

export enum SubscriptionStatus {
  ACTIVE = 'active',
  CANCELLED = 'cancelled',
  CANCELLING = 'cancelling',
  EXPIRED = 'expired',
  PAUSED = 'paused',
  FAILED = 'failed'
}

export interface UserSubscriptionAttributes {
  id: string;
  userId: string;
  planId: string;
  status: SubscriptionStatus;
  
  // Gateway Info
  gatewaySubscriptionId?: string; // Stripe subscription ID
  
  // Dates
  startDate: Date;
  endDate?: Date; // null for lifetime
  renewalDate?: Date; // next billing date
  
  // Cancellation
  cancelledAt?: Date;
  cancellationReason?: string;
  
  createdAt?: Date;
  updatedAt?: Date;
}

interface UserSubscriptionCreationAttributes
  extends Optional<UserSubscriptionAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class UserSubscription
  extends Model<
    UserSubscriptionAttributes,
    UserSubscriptionCreationAttributes
  >
  implements UserSubscriptionAttributes
{
  public id!: string;
  public userId!: string;
  public planId!: string;
  public status!: SubscriptionStatus;
  public gatewaySubscriptionId?: string;
  public startDate!: Date;
  public endDate?: Date;
  public renewalDate?: Date;
  public cancelledAt?: Date;
  public cancellationReason?: string;
  public createdAt?: Date;
  public updatedAt?: Date;
}

UserSubscription.init(
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
      planId: {
          type: DataTypes.UUID,
          allowNull: false,
          references: {
              model: 'subscription_plans',
              key: 'id',
          },
      },
      status: {
          type: DataTypes.ENUM(...Object.values(SubscriptionStatus)),
          allowNull: false,
          defaultValue: SubscriptionStatus.ACTIVE,
      },
      gatewaySubscriptionId: {
          type: DataTypes.STRING,
          allowNull: true,
          comment: 'Stripe or other payment gateway subscription ID',
      },
      startDate: {
          type: DataTypes.DATE,
          allowNull: false,
      },
      endDate: {
          type: DataTypes.DATE,
          allowNull: true,
          comment: 'null for lifetime subscriptions',
      },
      renewalDate: {
          type: DataTypes.DATE,
          allowNull: true,
          comment: 'next billing/renewal date for recurring plans',
      },
      cancelledAt: {
          type: DataTypes.DATE,
          allowNull: true,
      },
      cancellationReason: {
          type: DataTypes.TEXT,
          allowNull: true,
      }
  },
  {
    sequelize: users_service_db,
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
  }
);

export default UserSubscription;