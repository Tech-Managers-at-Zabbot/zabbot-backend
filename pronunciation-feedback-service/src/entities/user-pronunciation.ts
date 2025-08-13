import { DataTypes, Model } from "sequelize";
import { UserPronunciationAttributes } from "../data-types/interface";
import { users_service_db } from "../../../config/databases";

class UserPronunciation
  extends Model<UserPronunciationAttributes>
  implements UserPronunciationAttributes
{
  public id!: string;
  public userId!: string;
  public pronunciationId!: string;
  public recordingUrl!: string;
  public pronuciationPlotUrl!: string;
}

UserPronunciation.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      allowNull: false,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    pronunciationId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    recordingUrl: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    pronuciationPlotUrl: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize: users_service_db,
    modelName: "UserPronunciation",
    tableName: "user_pronunciation",
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ["userId", "pronunciationId"],
      },
    ],
  }
);

export default UserPronunciation;
