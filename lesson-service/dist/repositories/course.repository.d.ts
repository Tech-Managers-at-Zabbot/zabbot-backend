import { Transaction } from "sequelize";
import Courses from "../entities/course";
declare const courseRepositories: {
    getCourses: (isActive: boolean | undefined, languageId: string) => Promise<Courses[]>;
    getCourse: (id: string) => Promise<Courses | null>;
    getCourseWithLanguageId: (languageId: string) => Promise<Courses | null>;
    getCourseByTitle: (title: string) => Promise<Courses | null>;
    addCourse: (courseData: any, transaction?: Transaction) => Promise<Courses>;
    updateCourse: (courseData: any, transaction?: Transaction) => Promise<any>;
    deleteCourse: (id: string) => Promise<{
        message: string;
    }>;
};
export default courseRepositories;
