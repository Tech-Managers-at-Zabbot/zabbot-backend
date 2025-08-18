import { DataTypes, Model } from 'sequelize';
import { users_service_db } from '../../../../config/databases';
import { UserQuizAnswerAttributes } from '../../../databaseTypes/lesson-service-types';


class UserQuizAnswers extends Model<UserQuizAnswerAttributes> implements UserQuizAnswerAttributes {
  public id!: string;
  public userId!: string;
  public quizId!: string;
  public courseId!: string;
  public lessonId?: string;
  public contentId?: string;
  public userAnswer!: string;
  public isCorrect!: boolean;
  public createdAt!: Date;
  public updatedAt?: Date;
}

UserQuizAnswers.init(
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
    quizId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    courseId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    lessonId: {
      type: DataTypes.UUID,
      allowNull: true, // null if quiz is for content
    },
    contentId: {
      type: DataTypes.UUID,
      allowNull: true, // null if quiz is for lesson
    },
    userAnswer: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    isCorrect: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize: users_service_db,
    modelName: 'UserQuizAnswers',
    tableName: 'user_quiz_answers',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['userId', 'quizId'], // Prevent duplicate answers for same quiz
      },
      {
        fields: ['userId', 'courseId'], // For querying user's course progress
      },
      {
        fields: ['userId', 'lessonId'], // For querying user's lesson progress
      },
      {
        fields: ['userId', 'contentId'], // For querying user's content progress
      }
    ]
  }
);

export default UserQuizAnswers;