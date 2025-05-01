import { Sequelize } from 'sequelize';
declare const sequelize: Sequelize;
export declare const connectDB: () => Promise<void>;
export default sequelize;
