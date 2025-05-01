import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config()

const sequelize = new Sequelize(`${process.env.DB_URL}`,
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