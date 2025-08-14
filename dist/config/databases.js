"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ededun_database = exports.users_service_db = exports.founders_list_db = void 0;
const sequelize_1 = require("sequelize");
const config_1 = __importDefault(require("./config"));
const path_1 = __importDefault(require("path"));
const { FOUNDERS_LIST_DB, USERS_SERVICE_DB, EDEDUN_DB } = config_1.default;
const certificatePath = path_1.default.join(__dirname, "../ssl/ca-certificate.crt");
const founders_list_db = new sequelize_1.Sequelize(`${FOUNDERS_LIST_DB}`, {
    dialect: "postgres",
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
        },
    },
});
exports.founders_list_db = founders_list_db;
const ededun_database = new sequelize_1.Sequelize(`${EDEDUN_DB}`, {
    dialect: "postgres",
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000,
    },
});
exports.ededun_database = ededun_database;
const users_service_db = new sequelize_1.Sequelize(`${USERS_SERVICE_DB}`, {
    dialect: "postgres",
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
        },
    },
});
exports.users_service_db = users_service_db;
