import { Model } from 'sequelize';
import { UserCourseAttributes } from '../../../databaseTypes/lesson-service-types';
declare class UserCourses extends Model<UserCourseAttributes> implements UserCourseAttributes {
    id: string;
    userId: string;
    courseId: string;
    isCompleted: boolean;
    lastAccessed?: Date;
    progress?: number;
    lastLessonId?: string;
    lastContentId?: string;
    languageId: string;
    isActive: boolean;
}
export default UserCourses;
