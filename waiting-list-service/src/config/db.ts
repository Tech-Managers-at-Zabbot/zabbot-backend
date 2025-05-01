import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import path from 'path';


dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const config = {
    dbUrl: process.env.DB_URL,
};

const sequelize = new Sequelize(`${config.dbUrl}`,
    {
        pool: {
          max: 5,
          min: 0,
          acquire: 30000,
          idle: 10000,
        },
    }
)

export const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');
    await sequelize.sync();
    console.log('All models were synchronized successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
};

export default sequelize;