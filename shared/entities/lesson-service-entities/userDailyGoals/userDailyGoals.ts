import { DataTypes, Model } from "sequelize";
import { users_service_db } from "../../../../config/databases";
import { UserDailyGoalAttributes } from "../../../databaseTypes/lesson-service-types";

class UserDailyGoals
  extends Model<UserDailyGoalAttributes>
  implements UserDailyGoalAttributes
{
  public id!: string;
  public userId!: string;
  public languageId?: string;
  public isCompleted!: boolean;
  public completedAt?: Date;
  public updatedAt?: Date;
  public percentageCompletion!: number;
  public date!: Date;
}

UserDailyGoals.init(
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
        model: "users",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
    languageId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "languages",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
    isCompleted: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    percentageCompletion: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
  },
  {
    sequelize: users_service_db,
    modelName: "UserDailyGoals",
    tableName: "userDailyGoals",
    timestamps: true,
  }
);

export default UserDailyGoals;
