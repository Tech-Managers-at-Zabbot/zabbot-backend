import { Model } from "sequelize";
import { UserDailyGoalAttributes } from "../data-types/interface";
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
