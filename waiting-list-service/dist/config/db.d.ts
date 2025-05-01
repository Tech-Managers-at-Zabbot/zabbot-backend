import { Sequelize } from 'sequelize';
export declare const config: {
    dbUrl: string | undefined;
};
declare const sequelize: Sequelize;
export declare const connectDB: () => Promise<void>;
export default sequelize;
