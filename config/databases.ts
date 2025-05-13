import {Sequelize} from 'sequelize';
import config from './config';
import fs from 'fs';
import path from 'path';


const {
    DB_URL
} = config

const certificatePath = path.join(__dirname, '../ssl/ca-certificate.crt');

const database = new Sequelize(`${DB_URL}`,
    {
      dialect: 'postgres',
        pool: {
          max: 5,
          min: 0,
          acquire: 30000,
          idle: 10000,
        },
        dialectOptions: {
          ssl: {
            require: false,
            rejectUnauthorized: false,
            // ca: fs.readFileSync(certificatePath).toString(),
          }
        }
    }
)

database.sync({}).then(() => {
    console.log(config.stage, "database connected");
  })
  .catch((error: any) => {
    console.log("No connection:", error);
  });



export default database;