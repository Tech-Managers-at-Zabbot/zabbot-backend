"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.joinWaitingList = exports.config = void 0;
const waitingList_1 = __importDefault(require("../entities/waitingList"));
const uuid_1 = require("uuid");
const axios_1 = __importDefault(require("axios"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, '../../../.env') });
exports.config = {
    NOTIFICATION_SERVICE_ROUTE: process.env.NOTIFICATION_SERVICE_ROUTE
};
const joinWaitingList = async (request, response) => {
    try {
        const { name, email, country, sendUpdates, betaTest, contributeSkills } = request.body;
        if (!name || !email || !country) {
            response.status(400).json({ message: 'Name, email, and country are required' });
            return;
        }
        if (!sendUpdates && !betaTest && !contributeSkills) {
            response.status(400).json({ message: 'Please select at least one option' });
            return;
        }
        const existingUser = await waitingList_1.default.findOne({ where: { email } });
        if (existingUser) {
            response.status(409).json({ message: 'Email already exists in founders list' });
            return;
        }
        const newEntry = await waitingList_1.default.create({
            id: (0, uuid_1.v4)(),
            name,
            email,
            country,
            sendUpdates,
            betaTest,
            contributeSkills
        });
        response.status(201).json({
            message: 'Successfully joined founders list',
            data: newEntry
        });
        const mailChimpData = {
            email,
            firstName: name.split(' ')[0],
            lastName: name.split(' ')[1] || ""
        };
        axios_1.default.post(`${exports.config.NOTIFICATION_SERVICE_ROUTE}/founding-list/welcome`, mailChimpData);
    }
    catch (error) {
        console.error(error);
        if (error.name === 'SequelizeValidationError') {
            response.status(400).json({
                message: 'Validation error',
                errors: error.errors.map((err) => err.message)
            });
            return;
        }
        response.status(500).json({ message: 'Server error' });
    }
};
exports.joinWaitingList = joinWaitingList;
