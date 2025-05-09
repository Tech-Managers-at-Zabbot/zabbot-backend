"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const sequelize_1 = require("sequelize");
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, '../../.env') });
exports.config = {
    dbUrl: process.env.DB_URL,
};
const database = new sequelize_1.Sequelize(`${exports.config.dbUrl}`, {
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000,
    },
});
database.sync({}).then(() => {
    console.log("Database is connected");
})
    .catch((error) => {
    console.log("No connection:", error);
});
exports.default = database;
//# sourceMappingURL=db.js.map