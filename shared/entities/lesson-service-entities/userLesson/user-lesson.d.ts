import { Model } from "sequelize";
import { UserLessonAttributes } from "../../../databaseTypes/lesson-service-types";
declare class UserLessons extends Model<UserLessonAttributes> implements UserLessonAttributes {
    id: string;
    userId: string;
    courseId: string;
    lessonId: string;
    languageId: string;
    percentageCompletion: number;
    isCompleted: boolean;
    score?: number;
    startedAt?: Date;
    completedAt?: Date;
    lastAccessed?: Date;
    createdAt?: Date;
    updatedAt?: Date;
}
export default UserLessons;
