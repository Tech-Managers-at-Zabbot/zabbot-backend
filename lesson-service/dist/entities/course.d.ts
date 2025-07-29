import { Model } from 'sequelize';
import { CourseAttributes } from '../data-types/interface';
import { Level } from "../data-types/enums";
declare class Courses extends Model<CourseAttributes> implements CourseAttributes {
    id: string;
    title: string;
    description?: string;
    languageId: string;
    isActive: boolean;
    estimatedDuration?: number;
    totalLessons?: number;
    thumbnailImage?: string;
    tags?: string[];
    prerequisites?: string[];
    createdAt: Date;
    updatedAt?: Date;
    level: Level;
    totalContents?: number;
}
export default Courses;
