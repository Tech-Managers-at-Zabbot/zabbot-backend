import Otp from "../../entities/otp.entities";
import { Transaction } from "sequelize";
declare const otpRepositories: {
    create: (data: any, transaction?: Transaction) => Promise<Otp>;
    getByPK: (id: string) => Promise<Otp | null>;
    getOne: (filter: any, projection?: any) => Promise<Otp>;
    getLatestOtp: (filter: any, projection?: any) => Promise<Otp>;
    updateOne: (filter: any, update: any, transaction?: Transaction) => Promise<any>;
    deleteOne: (filter: any) => Promise<Otp>;
};
export default otpRepositories;
