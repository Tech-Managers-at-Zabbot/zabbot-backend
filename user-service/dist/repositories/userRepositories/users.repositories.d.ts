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
    getMany: (filter: any, projection?: any, options?: any, order?: any) => Promise<Users[]>;
    extractUserDetails: (userData: Record<string, any>) => Promise<{
        email: any;
        firstName: any;
        lastName: any;
        role: any;
        id: any;
        isFirstTimeLogin: any;
    }>;
};
export default userRepositories;
