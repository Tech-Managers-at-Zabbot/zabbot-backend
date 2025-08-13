import { Transaction } from "sequelize";
import Quiz from "../entities/quiz";
declare const quizRepositories: {
    getQuizzes: (filter: Record<string, any>, isActive?: boolean) => Promise<Quiz[]>;
    getQuiz: (id: string) => Promise<Quiz | null>;
    addQuiz: (quizData: Record<string, any> | any, transaction?: Transaction) => Promise<Quiz>;
    updateQuiz: (quizData: Record<string, any> | any, transaction?: Transaction) => Promise<any>;
    deleteQuiz: (id: string) => Promise<{
        message: string;
    }>;
};
export default quizRepositories;
