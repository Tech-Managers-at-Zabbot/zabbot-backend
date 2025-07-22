import { Sequelize } from 'sequelize';
import config from './config';
import fs from 'fs';
import path from 'path';


const {
  FOUNDERS_LIST_DB,
  USERS_SERVICE_DB,
  EDEDUN_DB
} = config

const certificatePath = path.join(__dirname, '../ssl/ca-certificate.crt');

const founders_list_db = new Sequelize(`${FOUNDERS_LIST_DB}`,
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

const ededun_database = new Sequelize(`${EDEDUN_DB}`,
  {
    dialect: 'postgres',
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  }
)

// founders_list_db.sync({}).then(() => {
//     console.log(`Stage is: ${config.stage}`, "Founders list database connected");
//   })
//   .catch((error: any) => {
//     console.log("No connection:", error);
//   });

const users_service_db = new Sequelize(`${USERS_SERVICE_DB}`,
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

// users_service_db.sync({}).then(() => {
//     console.log(`Stage is: ${config.stage}`, "Users database connected");
//   })
//   .catch((error: any) => {
//     console.log("No connection:", error);
//   });



export {
  founders_list_db,
  users_service_db,
  ededun_database
};