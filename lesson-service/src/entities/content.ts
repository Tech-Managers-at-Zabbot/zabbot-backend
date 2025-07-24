import { DataTypes, Model, Sequelize } from 'sequelize';
import { users_service_db } from '../../../config/databases';
import { ContentAttributes } from '../data-types/interface';
import { Level } from "../data-types/enums";

class Contents extends Model<ContentAttributes> implements ContentAttributes {
  public id!: string;
  public lessonId!: string;
  public languageContentId!: string;
  public translation?: string;
  public level!: Level;
  public createdAt!: Date;
  public updatedAt?: Date;
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
    languageContentId: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true
    },
    translation: {
      type: DataTypes.STRING,
      allowNull: false
    },
    level: {
      type: DataTypes.ENUM,
      values: Object.values(Level),
      allowNull: false
    },
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
    timestamps: true,
    paranoid: true,
  }
);

export default Contents;