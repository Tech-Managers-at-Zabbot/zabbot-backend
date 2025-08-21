import { DataTypes, Model, Sequelize } from 'sequelize';
import { users_service_db } from '../../../config/databases';
import { OptionAttributes } from '../data-types/interface';

class Options extends Model<OptionAttributes> implements OptionAttributes {
  public id!: string;
  public name!: string;
  public questionId!: string;
  public isCorrect!: boolean;
}

Options.init(
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
    questionId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    isCorrect: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    }
  },
  {
    sequelize: users_service_db,
    modelName: 'Options',
    tableName: 'options',
    timestamps: true,
  }
);

export default Options;