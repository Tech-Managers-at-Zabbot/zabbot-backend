import { Model } from 'sequelize';
import { UserQuizAnswerAttributes } from '../../../databaseTypes/lesson-service-types';
declare class UserQuizAnswers extends Model<UserQuizAnswerAttributes> implements UserQuizAnswerAttributes {
    id: string;
    userId: string;
    quizId: string;
    courseId: string;
    lessonId?: string;
    contentId?: string;
    userAnswer: string;
    isCorrect: boolean;
    createdAt: Date;
    updatedAt?: Date;
}
export default UserQuizAnswers;
