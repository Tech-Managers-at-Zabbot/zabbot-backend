"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const config_1 = __importDefault(require("./config"));
const path_1 = __importDefault(require("path"));
const { DB_URL } = config_1.default;
const certificatePath = path_1.default.join(__dirname, '../ssl/ca-certificate.crt');
const database = new sequelize_1.Sequelize(`${DB_URL}`, {
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
        }
    }
});
database.sync({}).then(() => {
    console.log(config_1.default.stage, "database connected");
})
    .catch((error) => {
    console.log("No connection:", error);
});
exports.default = database;
