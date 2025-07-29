import { Model } from 'sequelize';
import { LessonAttributes } from '../data-types/interface';
declare class Lessons extends Model<LessonAttributes> implements LessonAttributes {
    id: string;
    title: string;
    description: string;
    courseId: string;
    createdAt: Date;
    updatedAt?: Date;
    orderNumber: string;
    totalContents?: number;
    headLineTag?: string;
    outcomes?: string;
    objectives?: string;
    estimatedDuration: number;
}
export default Lessons;
