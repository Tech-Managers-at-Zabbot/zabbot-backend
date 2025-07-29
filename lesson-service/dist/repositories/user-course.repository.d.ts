import { Transaction } from "sequelize";
import UserCourses from "../entities/user-course";
declare const userCourseRepositories: {
    getUserCourses: (filter?: {
        userId?: string;
        courseId?: string;
    }) => Promise<UserCourses[]>;
    getUserCourse: (id: string) => Promise<UserCourses | null>;
    addUserCourse: (userCourseData: any, transaction?: Transaction) => Promise<UserCourses>;
    updateUserCourse: (userCourseData: any, transaction?: Transaction) => Promise<any>;
    deleteUserCourse: (id: string) => Promise<{
        message: string;
    }>;
};
export default userCourseRepositories;
