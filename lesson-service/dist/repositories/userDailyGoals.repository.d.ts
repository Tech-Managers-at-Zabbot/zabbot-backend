import { Transaction } from "sequelize";
import UserDailyGoals from "../entities/userDailyGoals";
declare const userDailyGoalRepositories: {
    create: (data: any, transaction?: Transaction) => Promise<UserDailyGoals>;
    updateOne: (filter: any, update: any, transaction?: Transaction) => Promise<any>;
    deleteOne: (filter: any) => Promise<UserDailyGoals>;
    getCount: (filter: Record<string, any>) => Promise<number>;
    getOne: (filter: Record<string, any>, projection?: any) => Promise<UserDailyGoals | null>;
};
export default userDailyGoalRepositories;
