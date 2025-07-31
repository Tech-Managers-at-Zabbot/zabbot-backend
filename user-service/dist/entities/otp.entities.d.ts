import { Model } from 'sequelize';
import { OtpNotificationType, OtpAttributes } from '../types/users.types';
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
