import { DataTypes, Model, Sequelize, Op } from 'sequelize';
import { users_service_db } from '../../../../config/databases';
import { UserCourseAttributes } from '../../../databaseTypes/lesson-service-types';


class UserCourses extends Model<UserCourseAttributes> implements UserCourseAttributes {
  public id!: string;
  public userId!: string;
  public courseId!: string;
  public isCompleted!: boolean
  public lastAccessed?: Date;
  public progress?: number;
  public lastLessonId?: string;
  public lastContentId?: string;
  public languageId!: string;
  public isActive!: boolean;
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
    },
    languageId: {
       type: DataTypes.UUID,
      allowNull: false,
    },
    courseId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    lastAccessed: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    progress: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    lastLessonId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    lastContentId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    isCompleted: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    isActive: {
       type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    }
  },
  {
    sequelize: users_service_db,
    modelName: 'User_Courses',
    tableName: 'user_courses',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['userId', 'lastLessonId'],
        name: 'user_courses_userId_lastLessonId_unique_idx',
         where: {
          lastLessonId: {
            [Op?.ne]: null
          }
        }
      },
      {
        fields: ['userId', 'courseId'],
        name: 'user_courses_userId_courseId_idx'
      },
      {
        fields: ['courseId'],
        name: 'user_courses_courseId_idx'
      }
    ]
  }
);


export default UserCourses;