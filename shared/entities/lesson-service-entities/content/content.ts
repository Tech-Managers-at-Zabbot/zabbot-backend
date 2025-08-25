import { DataTypes, Model, Sequelize } from "sequelize";
import { users_service_db } from "../../../../config/databases";
import {
  ContentAttributes,
  ContentSourceType,
  ContentType,
  GrammarExample,
} from "../../../databaseTypes/lesson-service-types";

class Contents extends Model<ContentAttributes> implements ContentAttributes {
  public id!: string;
  public lessonId!: string;
  public languageId!: string;
  public translation?: string;
  public contentType!: string;
  public proverb?: string;
  public createdAt?: Date;
  public updatedAt?: Date;
  public isGrammarRule?: boolean;
  public sourceType!: string;
  public customText?: string;
  public grammarTitle?: string;
  public grammarSubtitle?: string;
  public grammarDescription?: string[];
  public grammarExamples?: GrammarExample[];
  public ededunPhrases?: string;
}

Contents.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    lessonId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    languageId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    isGrammarRule: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    contentType: {
      type: DataTypes.ENUM(...Object.values(ContentType)),
      allowNull: false,
      defaultValue: ContentType.NORMAL,
    },
    proverb: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    grammarTitle: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    grammarSubtitle: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    grammarDescription: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    grammarExamples: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    sourceType: {
      type: DataTypes.ENUM(...Object.values(ContentSourceType)),
      allowNull: false,
      defaultValue: ContentSourceType.NEW,
    },
    customText: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    ededunPhrases: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    translation: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.DATE,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize: users_service_db,
    modelName: "Contents",
    tableName: "contents",
    // timestamps: true,
  }
);

export default Contents;
