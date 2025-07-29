import { Model } from 'sequelize';
import { UserCourseAttributes } from '../data-types/interface';
declare class UserCourses extends Model<UserCourseAttributes> implements UserCourseAttributes {
    id: string;
    userId: string;
    courseId: string;
    createdAt: Date;
}
export default UserCourses;
