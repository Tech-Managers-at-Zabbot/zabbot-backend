import { DataTypes, Model, Optional } from "sequelize";
import db from "../../../config/databases";

// These attributes represent a row in the DB
interface ReferencePronunciationAttributes {
  id: number;
  word: string;
  maleVoicePath: string;
  femaleVoicePath: string;
}

// Optional fields when creating a new user
interface ReferencePronunciationCreationAttributes
  extends Optional<ReferencePronunciationAttributes, "id"> {}

export class ReferencePronunciation
  extends Model<
    ReferencePronunciationAttributes,
    ReferencePronunciationCreationAttributes
  >
  implements ReferencePronunciationAttributes
{
  public id!: number;
  public word!: string;
  public maleVoicePath!: string;
  public femaleVoicePath!: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

ReferencePronunciation.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    word: {
      type: new DataTypes.STRING(128),
      allowNull: false,
    },
    maleVoicePath: {
      type: new DataTypes.STRING(128),
      allowNull: false,
    },
    femaleVoicePath: {
      type: new DataTypes.STRING(128),
      allowNull: false,
    },
  },
  {
    sequelize: db,
    tableName: "reference_pronunciations",
  }
);
