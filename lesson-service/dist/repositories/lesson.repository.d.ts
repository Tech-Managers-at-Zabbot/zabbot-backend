import { Transaction } from "sequelize";
import Lessons from "../entities/lesson";
declare const lessonRepositories: {
    getLessons: (filter?: {
        courseId: string;
    }) => Promise<Lessons[]>;
    getLesson: (id: string) => Promise<Lessons | null>;
    addLesson: (lessonData: any, transaction?: Transaction) => Promise<Lessons>;
    updateLesson: (lessonData: any, transaction?: Transaction) => Promise<any>;
};
export default lessonRepositories;
