import { Model } from 'sequelize';
import { QuizAttributes } from '../data-types/interface';
import { QuizType } from '../data-types/enums';
declare class Quizzes extends Model<QuizAttributes> implements QuizAttributes {
    id: string;
    courseId: string;
    lessonId?: string;
    contentId?: string;
    languageId: string;
    quizType: QuizType;
    instruction: string;
    question: string;
    options?: string[];
    correctOption?: string;
    correctAnswer?: string;
    createdAt: Date;
    updatedAt?: Date;
}
export default Quizzes;
