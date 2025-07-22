import { DataTypes, Model, Sequelize } from 'sequelize';
import { users_service_db } from '../../../config/databases';
import { ContentFileAttributes, LanguageAttributes } from '../data-types/interface';
import { ContentDataType } from '../data-types/enums';

class ContentFiles extends Model<ContentFileAttributes> implements ContentFileAttributes {
  public id?: string;
  public contentId!: string;
  public contentType!: ContentDataType;
  public filePath?: string;
  public createdAt!: Date;
}

ContentFiles.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    contentId: {
      type: DataTypes.UUID,
      allowNull: false
    },
    contentType: {
      type: DataTypes.ENUM,
      allowNull: false,
    },
    filePath: {
      type: DataTypes.STRING,
      allowNull: false
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize: users_service_db,
    modelName: 'ContentFiles',
    tableName: 'content_files',
    timestamps: true,
    paranoid: true,
  }
);

export default ContentFiles;