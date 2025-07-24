import { DataTypes, Model, Sequelize } from 'sequelize';
import { users_service_db } from '../../../config/databases';
import { LanguageAttributes } from '../data-types/interface';
import { LanguageCode } from '../data-types/enums';
// import { UserAttributes, UserRoles, RegisterMethods, ProfileVisibility } from '../types/users.types';

class Languages extends Model<LanguageAttributes> implements LanguageAttributes {
  public id!: string;
  public title!: string;
  public code!: string;
  public isActive?: boolean;
  public totalCourses?: number;
  public flagIcon?: string;
  public totalLessons?: number;
}

Languages.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    code: {
      type: DataTypes.ENUM(...Object.values(LanguageCode)),
      allowNull: false,
      unique: false,
    },
    totalCourses: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
    },
    flagIcon: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    totalLessons: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    }
  },
  {
    sequelize: users_service_db,
    modelName: 'Languages',
    tableName: 'languages',
    timestamps: true,
    paranoid: true,
  }
);

export default Languages;