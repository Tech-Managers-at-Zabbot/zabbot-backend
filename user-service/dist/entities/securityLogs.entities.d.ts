import { Model, Optional } from 'sequelize';
import { SecurityLogAttributes, SecurityLevel } from '../types/users.types';
interface SecurityLogCreationAttributes extends Optional<SecurityLogAttributes, 'id' | 'timestamp' | 'resolved'> {
}
export declare class SecurityLog extends Model<SecurityLogAttributes, SecurityLogCreationAttributes> implements SecurityLogAttributes {
    id: number;
    userId?: number;
    eventType: string;
    severity: SecurityLevel;
    ipAddress: string;
    userAgent?: string;
    details: object;
    timestamp: Date;
    resolved: boolean;
}
export {};
