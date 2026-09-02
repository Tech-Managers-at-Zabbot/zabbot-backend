import { DataTypes, Model, Sequelize } from "sequelize";
import { users_service_db } from "../../../../config/databases";
import { FlashcardAttributes, IconAttribution } from "../../../databaseTypes/lesson-service-types";

class Flashcards
  extends Model<FlashcardAttributes>
  implements FlashcardAttributes
{
  public id!: string;
  public language!: string;
  public yorubaWord!: string;
  public englishWord!: string;
  public transcription!: string;
  public tonal!: string;
  public image!: string;
  public audio!: string[];
  public iconAttributions!: IconAttribution;
  public createdAt!: Date;
  public updatedAt?: Date;
}

Flashcards.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    language: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    yorubaWord: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    englishWord: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    transcription: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    tonal: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    image: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    audio: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: false,
      defaultValue: [],
    },
    iconAttributions: {
      type: DataTypes.JSON,
      allowNull: false,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize: users_service_db,
    modelName: "Flashcards",
    tableName: "flashcards",
    timestamps: true,
  }
);

export default Flashcards;
