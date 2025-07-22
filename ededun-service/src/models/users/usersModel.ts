import { DataTypes, Model } from "sequelize";
import { ededun_database } from "../../../../config/databases";
import {
  UserAttributes,
  Roles,
  Gender,
  AgeGroup
} from "../../types/modelTypes";

export class User extends Model<UserAttributes> {}

User.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      allowNull: false,
    },

    firstName: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    lastName: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    email: {
      type: DataTypes.TEXT,
      allowNull: false,
      unique: {
        name: "unique_email",
        msg: "Email already in use",
      },
    },

    phone: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    role: {
      type: DataTypes.ENUM(...Object.values(Roles)),
      allowNull: false,
      validate: {
        isIn: [Object.values(Roles)],
      },
    },

    gender: {
      type: DataTypes.ENUM(...Object.values(Gender)),
      allowNull: false,
    },

    ageGroup: {
      type: DataTypes.ENUM(...Object.values(AgeGroup)),
      allowNull: false,
    },

    password: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    refreshToken: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize: ededun_database,
    tableName: "User",
  }
);

export default User;