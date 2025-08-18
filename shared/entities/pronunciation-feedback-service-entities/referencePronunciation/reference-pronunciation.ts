import { DataTypes, Model, Sequelize } from "sequelize";
import { users_service_db } from "../../../../config/databases";
import { ReferencePronunciationAttributes } from "../../../databaseTypes/pronunciation-feedback-types";

class ReferencePronunciation
  extends Model<ReferencePronunciationAttributes>
  implements ReferencePronunciationAttributes
{
  public id!: string;
  public word!: string;
public englishWord!: string;
  public yorubaWord!: string;
  public femaleVoice!: string;
  public maleVoice!: string;
  public tone!: string;
}

ReferencePronunciation.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      allowNull: false,
    },
    englishWord: {
      type: DataTypes.STRING,
      allowNull: false,
    },
     yorubaWord: {
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
     tone: {
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
