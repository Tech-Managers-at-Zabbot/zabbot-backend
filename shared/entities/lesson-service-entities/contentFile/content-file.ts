import { DataTypes, Model, Sequelize } from 'sequelize';
import { users_service_db } from '../../../../config/databases';
import { ContentDataType, ContentFileAttributes } from '../../../databaseTypes/lesson-service-types';

class ContentFiles extends Model<ContentFileAttributes> implements ContentFileAttributes {
  public id?: string;
  public contentId!: string;
  public contentType!: ContentDataType;
  public filePath?: string;
  public createdAt!: Date;
  public description?: string;
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
      type: DataTypes.ENUM(...Object.values(ContentDataType)),
      allowNull: false,
      defaultValue: ContentDataType.AUDIO,
    },
    filePath: {
      type: DataTypes.STRING,
      allowNull: false
    },
     description: {
      type: DataTypes.TEXT,
      allowNull: true,
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
  }
);

export default ContentFiles;