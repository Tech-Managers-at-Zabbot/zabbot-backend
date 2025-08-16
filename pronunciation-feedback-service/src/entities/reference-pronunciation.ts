import { DataTypes, Model, Sequelize } from "sequelize";
import { ReferencePronunciationAttributes } from "../data-types/interface";
import { users_service_db } from "../../../config/databases";

class ReferencePronunciation
  extends Model<ReferencePronunciationAttributes>
  implements ReferencePronunciationAttributes
{
  public id!: string;
  public word!: string;
  public femaleVoice!: string;
  public maleVoice!: string;
}

ReferencePronunciation.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      allowNull: false,
    },
    word: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    femaleVoice: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    maleVoice: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize: users_service_db,
    modelName: "ReferencePronunciation",
    tableName: "reference_pronunciation",
    timestamps: true,
  }
);

export default ReferencePronunciation;
