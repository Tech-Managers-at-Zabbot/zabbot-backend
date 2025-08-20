import { Model } from "sequelize";
import { UserDailyGoalAttributes } from "../../../databaseTypes/lesson-service-types";
declare class UserDailyGoals extends Model<UserDailyGoalAttributes> implements UserDailyGoalAttributes {
    id: string;
    userId: string;
    languageId?: string;
    isCompleted: boolean;
    completedAt?: Date;
    updatedAt?: Date;
    percentageCompletion: number;
    date: Date;
}
export default UserDailyGoals;
