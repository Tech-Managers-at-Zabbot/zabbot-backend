import { DataTypes, Model, Sequelize } from 'sequelize';
import { users_service_db } from '../../../config/databases';
import { ContentQuestionAttributes } from '../data-types/interface';

class ContentQuestions extends Model<ContentQuestionAttributes> implements ContentQuestionAttributes {
  public id!: string;
  public contentId!: string;
  public questionId!: string;
}

ContentQuestions.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    contentId: {
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

export default ContentQuestions;