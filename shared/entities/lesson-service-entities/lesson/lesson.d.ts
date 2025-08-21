import { Model } from 'sequelize';
import { LessonAttributes } from '../../../databaseTypes/lesson-service-types';
declare class Lessons extends Model<LessonAttributes> implements LessonAttributes {
    id: string;
    title: string;
    description: string;
    courseId: string;
    createdAt: Date;
    updatedAt?: Date;
    orderNumber: string;
    totalContents?: number;
    languageId: string;
    headLineTag?: string;
    outcomes?: string;
    objectives?: string;
    estimatedDuration: number;
}
export default Lessons;
