import { DataTypes, Model, Sequelize } from 'sequelize';
import { users_service_db } from '../../../config/databases';
import { LessonQuestionAttributes } from '../data-types/interface';

class LessonQuestions extends Model<LessonQuestionAttributes> implements LessonQuestionAttributes {
  public id!: string;
  public lessonId!: string;
  public questionId!: string;
}

LessonQuestions.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    lessonId: {
      type: DataTypes.STRING,
      allowNull: false
    },
    questionId: {
      type: DataTypes.STRING,
      allowNull: false,
    }
  },
  {
    sequelize: users_service_db,
    modelName: 'LessonQuestions',
    tableName: 'lesson-questions',
    timestamps: true,
  }
);

export default LessonQuestions;