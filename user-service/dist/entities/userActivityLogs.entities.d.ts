import { Model, Optional } from 'sequelize';
import { UserActivityLogAttributes, ActivityType, LogLevel } from '../types/users.types';
interface UserActivityLogCreationAttributes extends Optional<UserActivityLogAttributes, 'id' | 'timestamp'> {
}
export declare class UserActivityLog extends Model<UserActivityLogAttributes, UserActivityLogCreationAttributes> implements UserActivityLogAttributes {
    id: number;
    userId: number;
    activityType: ActivityType;
    description: string;
    ipAddress?: string;
    userAgent?: string;
    metadata?: object;
    level: LogLevel;
    timestamp: Date;
    sessionId?: string;
    resourceId?: string;
    success: boolean;
    readonly createdAt: Date;
    readonly updatedAt: Date;
}
export {};
