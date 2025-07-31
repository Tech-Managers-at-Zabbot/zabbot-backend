import { DataTypes, Model, Sequelize } from 'sequelize';
import { users_service_db } from '../../../config/databases';
import { CourseAttributes } from '../data-types/interface';
import { Level } from "../data-types/enums";

class Courses extends Model<CourseAttributes> implements CourseAttributes {
  public id!: string;
  public title!: string;
  public description?: string;
  public languageId!: string;
  public isActive!: boolean;
  public estimatedDuration?: number;
  public totalLessons?: number;
  public thumbnailImage?: string;
  public tags?: string[];
  public prerequisites?: string[];
  public createdAt!: Date;
  public updatedAt?: Date;
  public level!: Level
  public totalContents?: number
}

Courses.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    languageId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    level: {
      type: DataTypes.ENUM,
      values: Object.values(Level),
      allowNull: false
    },
    estimatedDuration: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    totalLessons: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0
    },
     totalContents: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0
    },
    thumbnailImage: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    tags: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: true,
    },
    prerequisites: {
      type: DataTypes.ARRAY(DataTypes.UUID),
      allowNull: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.DATE
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
  },
  {
    sequelize: users_service_db,
    modelName: 'Courses',
    tableName: 'courses',
    timestamps: true,
  }
);

export default Courses;