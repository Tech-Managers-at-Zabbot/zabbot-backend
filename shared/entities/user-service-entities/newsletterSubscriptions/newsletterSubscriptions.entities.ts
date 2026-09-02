import { DataTypes, Model } from "sequelize";
import { v4 as uuidv4 } from "uuid";
import { users_service_db } from "../../../../config/databases";

export interface NewsletterSubscriptionAttributes {
  id: string;
  email: string;
  createdAt?: Date;
  updatedAt?: Date;
}

class NewsletterSubscription
  extends Model<NewsletterSubscriptionAttributes>
  implements NewsletterSubscriptionAttributes
{
  public id!: string;
  public email!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

NewsletterSubscription.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      allowNull: false,
      defaultValue: () => uuidv4(),
    },

    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
  },
  {
    sequelize: users_service_db,
    modelName: "NewsletterSubscription",
    tableName: "newsletter_subscriptions",
    timestamps: true,
  },
);

export default NewsletterSubscription;
