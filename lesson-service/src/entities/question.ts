import { DataTypes, Model, Sequelize } from 'sequelize';
import { users_service_db } from '../../../config/databases';
import { QuestionAttributes } from '../data-types/interface';
import { QuestionType } from '../data-types/enums'

class Questions extends Model<QuestionAttributes> implements QuestionAttributes {
  public id!: string;
  public name!: string;
  public instruction?: string;
  public type!: QuestionType;
}

Questions.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    instruction: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM(...Object.values(QuestionType)),
      allowNull: false,
      defaultValue: QuestionType.SINGLE
    }
  },
  {
    sequelize: users_service_db,
    modelName: 'Questions',
    tableName: 'questions',
    timestamps: true,
  }
);

export default Questions;