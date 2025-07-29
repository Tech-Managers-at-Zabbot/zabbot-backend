import Users from "../../entities/users.entities";
import { Transaction } from "sequelize";
declare const userRepositories: {
    create: (data: any, transaction?: Transaction) => Promise<Users>;
    getByPK: (id: string) => Promise<Users | null>;
    updateOne: (filter: any, update: any, transaction?: Transaction) => Promise<any>;
    updateMany: (filter: any, update: any) => Promise<{
        affectedRows: number;
    }>;
    deleteOne: (filter: any) => Promise<Users>;
    deleteMany: (filter: any) => Promise<{
        affectedRows: number;
    }>;
    getOne: (filter: Record<string, any>, projection?: any) => Promise<Users | null>;
    getAllCount: () => Promise<number | undefined>;
    getMany: (filter: any, projection?: any, options?: any, order?: any) => Promise<Users[]>;
    extractUserDetails: (userData: Record<string, any>) => Promise<{
        email: any;
        firstName: any;
        lastName: any;
        role: any;
        id: any;
        isFirstTimeLogin: any;
        isVerified: any;
        isActive: any;
        isBlocked: any;
        verifiedAt: any;
        registerMethod: any;
        country: any;
        phoneNumber: any;
        deletedAt: any;
        profilePicture: any;
        bio: any;
        dateOfBirth: any;
        address: any;
        socialLinks: any;
        preferences: any;
        lastLoginAt: any;
        lastPasswordChangeAt: any;
        twoFactorEnabled: any;
        securityQuestions: any;
    }>;
};
export default userRepositories;
