import { Model } from 'sequelize';
import { OtpAttributes, OtpNotificationType } from '../../../databaseTypes/user-service-types';
declare class Otp extends Model<OtpAttributes> implements OtpAttributes {
    id: string;
    userId: string;
    otp: string;
    expiresAt: Date;
    isUsed: boolean;
    notificationType: OtpNotificationType;
    isVerified?: boolean;
    attempts?: number;
    verifiedAt?: Date;
    readonly createdAt: Date;
    readonly updatedAt: Date;
}
export default Otp;
