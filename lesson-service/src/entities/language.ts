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
  public flagIcon?: string;
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
    flagIcon: {
      type: DataTypes.STRING,
      allowNull: true,
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
    // paranoid: true,
  }
);

export default Languages;