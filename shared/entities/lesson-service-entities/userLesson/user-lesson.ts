import { DataTypes, Model } from "sequelize";
import { users_service_db } from "../../../../config/databases";
import { UserLessonAttributes } from "../../../databaseTypes/lesson-service-types";

class UserLessons
  extends Model<UserLessonAttributes>
  implements UserLessonAttributes
{
  public id!: string;
  public userId!: string;
  public courseId!: string;
  public lessonId!: string;
  public languageId!: string;
  public percentageCompletion!: number;
  public isCompleted!: boolean;
  public score?: number;
  public startedAt?: Date;
  public completedAt?: Date;
  public lastAccessed?: Date;
  public createdAt?: Date;
  public updatedAt?: Date;
}

UserLessons.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
    courseId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "courses",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
    lessonId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "lessons",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
    languageId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "languages",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
    percentageCompletion: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0,
        max: 100,
      },
    },
    isCompleted: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    score: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
      validate: {
        min: 0,
      },
    },
    startedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    completedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    lastAccessed: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize: users_service_db,
    modelName: "UserLessons",
    tableName: "user_lessons",
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ["userId", "lessonId"],
        name: "user_lessons_userId_lessonId_unique_idx",
      },
      {
        fields: ["userId", "courseId"],
        name: "user_lessons_userId_courseId_idx",
      },
      {
        fields: ["userId", "isCompleted"],
        name: "user_lessons_userId_isCompleted_idx",
      },
      {
        fields: ["courseId", "lessonId"],
        name: "user_lessons_courseId_lessonId_idx",
      },
    ],
  },
);

export default UserLessons;
