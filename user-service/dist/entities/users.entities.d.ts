import { Model } from 'sequelize';
import { UserAttributes, RegisterMethods } from '../types/users.types';
declare class Users extends Model<UserAttributes> implements UserAttributes {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    isVerified: boolean;
    isFirstTimeLogin: boolean;
    role: string;
    isActive: boolean;
    isBlocked: boolean;
    verifiedAt: Date;
    registerMethod: RegisterMethods;
    googleAccessToken?: string;
    googleRefreshToken?: string;
    accessToken?: string;
    refreshToken?: string;
    country?: string;
    phoneNumber?: string;
    deletedAt?: Date;
    profilePicture?: string;
    bio?: string;
    dateOfBirth?: Date;
    address?: string;
    timeZone: string;
    socialLinks?: {
        facebook?: string;
        twitter?: string;
        linkedin?: string;
        instagram?: string;
        youtube?: string;
        tiktok?: string;
    };
    preferences?: {
        language?: string;
        theme?: string;
        notifications?: {
            email?: boolean;
            sms?: boolean;
            push?: boolean;
        };
        privacy?: {
            profileVisibility?: string;
        };
    };
    lastLoginAt?: Date;
    lastPasswordChangeAt?: Date;
    twoFactorEnabled?: boolean;
    securityQuestions?: {
        question: string;
        answer: string;
    }[];
}
export default Users;
