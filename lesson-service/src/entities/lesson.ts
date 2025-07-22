import { DataTypes, Model, Sequelize } from 'sequelize';
import { users_service_db } from '../../../config/databases';
import { LessonAttributes } from '../data-types/interface';

class Lessons extends Model<LessonAttributes> implements LessonAttributes {
  public id!: string;
  public title!: string;
  public description!: string;
  public createdAt!: Date;
  public updatedAt?: Date;
}

Lessons.init(
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
    description: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
  },
  {
    sequelize: users_service_db,
    modelName: 'Lessons',
    tableName: 'lessons',
    timestamps: true,
    paranoid: true,
  }
);

export default Lessons;