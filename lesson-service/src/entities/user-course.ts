import { DataTypes, Model, Sequelize } from 'sequelize';
import { users_service_db } from '../../../config/databases';
import { UserCourseAttributes } from '../data-types/interface';
import { Level } from "../data-types/enums";

class UserCourses extends Model<UserCourseAttributes> implements UserCourseAttributes {
  public id!: string;
  public userId!: string;
  public courseId!: string;
  public createdAt!: Date;
}

UserCourses.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true
    },
    courseId: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.DATE
    }
  },
  {
    sequelize: users_service_db,
    modelName: 'User_Courses',
    tableName: 'user_courses',
    timestamps: true,
    paranoid: true,
  }
);

export default UserCourses;