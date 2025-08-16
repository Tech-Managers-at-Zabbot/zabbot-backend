import { Model } from 'sequelize';
import { LessonAttributes } from '../data-types/interface';
declare class Lessons extends Model<LessonAttributes> implements LessonAttributes {
    id: string;
    title: string;
    description: string;
<<<<<<< HEAD
    createdAt: Date;
    updatedAt?: Date;
=======
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
>>>>>>> 2f02c363aeb6a6515fd726c55e0d04a284f89bdb
}
export default Lessons;
