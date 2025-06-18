"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.associateUserModels = associateUserModels;
const otp_entities_1 = __importDefault(require("./otp.entities"));
const users_entities_1 = __importDefault(require("./users.entities"));
function associateUserModels() {
    otp_entities_1.default.belongsTo(users_entities_1.default, {
        foreignKey: 'userId',
        as: 'user',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
    });
    users_entities_1.default.hasMany(otp_entities_1.default, {
        foreignKey: 'userId',
        as: 'otps',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
    });
}
