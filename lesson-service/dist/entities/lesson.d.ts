import { Model } from 'sequelize';
import { LessonAttributes } from '../data-types/interface';
declare class Lessons extends Model<LessonAttributes> implements LessonAttributes {
    id: string;
    title: string;
    description: string;
    createdAt: Date;
    updatedAt?: Date;
}
export default Lessons;
