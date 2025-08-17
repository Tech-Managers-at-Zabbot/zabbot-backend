import { DataTypes, Model, Sequelize } from 'sequelize';
import { users_service_db } from '../../../config/databases';
import { LessonAttributes } from '../data-types/interface';

class Lessons extends Model<LessonAttributes> implements LessonAttributes {
  public id!: string;
  public title!: string;
  public description!: string;
  public courseId!: string;
  public createdAt!: Date;
  public updatedAt?: Date;
  public orderNumber!: string;
  public totalContents?: number;
  public languageId!: string;
  public headLineTag?: string;
  public outcomes?: string;
  public objectives?: string;
  public estimatedDuration!: number;
}

Lessons.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    title: {
      type: DataTypes.TEXT('long'),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT('long'),
      allowNull: false,
    },
    estimatedDuration: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    outcomes: {
      type: DataTypes.TEXT('long'),
      allowNull: true
    },
    objectives: {
      type: DataTypes.TEXT('long'),
      allowNull: true
    },
    languageId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    headLineTag: {
      type: DataTypes.TEXT('long'),
      allowNull: true,
    },
    courseId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    totalContents: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0
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
    orderNumber: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  },
  {
    sequelize: users_service_db,
    modelName: 'Lessons',
    tableName: 'lessons',
    timestamps: true,
  }
);

export default Lessons;