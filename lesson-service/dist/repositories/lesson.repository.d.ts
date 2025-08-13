import { Transaction } from "sequelize";
import Lessons from "../entities/lesson";
declare const lessonRepositories: {
    getLessons: (filter?: {
        courseId: string;
    }) => Promise<Lessons[]>;
    getLessonsOnly: (courseId: string) => Promise<Lessons[]>;
    getLanguageLessons: (languageId: string) => Promise<Lessons[]>;
    getLesson: (id: string, attributes?: string[]) => Promise<Lessons | null>;
    addLesson: (lessonData: any, transaction?: Transaction) => Promise<Lessons>;
    updateLesson: (lessonData: any, transaction?: Transaction) => Promise<any>;
};
export default lessonRepositories;
