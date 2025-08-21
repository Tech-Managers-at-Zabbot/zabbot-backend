import { DataTypes, Model, Sequelize } from 'sequelize';
import { users_service_db } from '../../../../config/databases';
import { QuizAttributes, QuizType } from '../../../databaseTypes/lesson-service-types';

class Quizzes extends Model<QuizAttributes> implements QuizAttributes {
  public id!: string;
  public courseId!: string;
  public lessonId?: string;
  public contentId?: string;
  public languageId!: string;
  public quizType!: QuizType;
  public instruction!: string;
  public question!: string;
  public options?: string[];
  public correctOption?: string;
  public correctAnswer?: string;
  public createdAt!: Date;
  public updatedAt?: Date;
}

Quizzes.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    courseId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    lessonId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    contentId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    languageId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    quizType: {
      type: DataTypes.ENUM(...Object.values(QuizType)),
      allowNull: false,
    },
    instruction: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    question: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    options: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: true,
    },
    correctOption: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    correctAnswer: {
      type: DataTypes.STRING,
      allowNull: true,
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
    modelName: 'Quizzes',
    tableName: 'quizzes',
    timestamps: true,
  }
);

export default Quizzes;