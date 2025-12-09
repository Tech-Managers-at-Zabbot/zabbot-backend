import { DataTypes, Model } from 'sequelize';
import { users_service_db } from '../../../../config/databases';

export enum PlanType {
  LIFETIME = 'lifetime',
  ANNUAL = 'annual',
  MONTHLY = 'monthly',
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

class SubscriptionPlan
  extends Model<SubscriptionPlanAttributes>
  implements SubscriptionPlanAttributes
{
  public id!: string;
  public planType!: PlanType;
  public price!: number;
  public currency!: string;
  public billingCycleMonths!: number;
  public features?: Record<string, any>;
  public createdAt?: Date;
  public updatedAt?: Date;
}

SubscriptionPlan.init(
  {
      id: {
          type: DataTypes.UUID,
          primaryKey: true,
          defaultValue: DataTypes.UUIDV4,
      },
      planType: {
          type: DataTypes.ENUM(...Object.values(PlanType)),
          allowNull: false,
          unique: true,
      },
      price: {
          type: DataTypes.DECIMAL(10, 2),
          allowNull: false,
          validate: { min: 0 },
      },
      currency: {
          type: DataTypes.STRING(3),
          allowNull: false,
          defaultValue: 'USD',
      },
      billingCycleMonths: {
          type: DataTypes.INTEGER,
          allowNull: true,
          comment: 'null for lifetime, 1 for monthly, 12 for annual',
      },
      features: {
          type: DataTypes.JSON,
          allowNull: true,
      },
  },
  {
    sequelize: users_service_db,
    modelName: 'SubscriptionPlan',
    tableName: 'subscription_plans',
    timestamps: true,
  }
);

export default SubscriptionPlan;
