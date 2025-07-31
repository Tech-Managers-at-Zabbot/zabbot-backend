import { DataTypes, Model, Sequelize } from 'sequelize';
import { users_service_db } from '../../../config/databases';
import { ContentAttributes } from '../data-types/interface';
import { ContentSourceType } from '../data-types/enums';

class Contents extends Model<ContentAttributes> implements ContentAttributes {
  public id!: string;
  public lessonId!: string;
  public languageContentId!: string;
  public translation?: string;
  // public totalContents?: number;
  public createdAt?: Date;
  public updatedAt?: Date;
  public isGrammarRule?: boolean;
  public sourceType!: string;
  public customText?: string;
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
      allowNull: false
    },
    isGrammarRule: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    sourceType: {
      type: DataTypes.ENUM(...Object.values(ContentSourceType)),
      allowNull: false,
      defaultValue: ContentSourceType.NEW
    },
     customText: {
      type: DataTypes.TEXT,
      allowNull: true
    },
     ededunPhrases: {
      type: DataTypes.JSON,
      allowNull: true
    },
    translation: {
      type: DataTypes.STRING,
      allowNull: false
    },
    // level: {
    //   type: DataTypes.ENUM,
    //   values: Object.values(Level),
    //   allowNull: false
    // },
    // key: {
    //   type: DataTypes.STRING,
    //   allowNull: true
    // },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.DATE
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
  },
  {
    sequelize: users_service_db,
    modelName: 'Contents',
    tableName: 'contents',
    // timestamps: true,
  }
);

export default Contents;