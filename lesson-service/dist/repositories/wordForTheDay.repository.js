"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const utilities_1 = require("../../../shared/utilities");
const wordForTheDay_1 = __importDefault(require("../../../shared/entities/lesson-service-entities/wordForTheDay/wordForTheDay"));
const wordForTheDayRepositories = {
    create: async (data, transaction) => {
        try {
            const newWordForTheDay = await wordForTheDay_1.default.create(data, { transaction });
            return newWordForTheDay;
        }
        catch (error) {
            console.log(`Create Daily Word Error: ${error.message}`);
            throw utilities_1.errorUtilities.createError(`Error creating daily word, please try again`, 500);
        }
    },
    updateOne: async (filter, update, transaction) => {
        try {
            const dailyWOrd = await wordForTheDay_1.default.findOne({ where: filter });
            await dailyWOrd.update(update, { transaction });
            return dailyWOrd;
        }
        catch (error) {
            throw utilities_1.errorUtilities.createError(`Error updating Daily Word: ${error.message}`, 400);
        }
    },
    deleteOne: async (filter) => {
        try {
            const dailyWOrd = await wordForTheDay_1.default.findOne({ where: filter });
            if (!dailyWOrd)
                throw new Error("Word not found");
            await dailyWOrd.destroy();
            return dailyWOrd;
        }
        catch (error) {
            throw new Error(`Error deleting daily word: ${error.message}`);
        }
    },
    getOne: async (filter, projection = null) => {
        try {
            const dailyWord = await wordForTheDay_1.default.findOne({
                where: filter,
                attributes: projection,
                raw: true
            });
            return dailyWord;
        }
        catch (error) {
            console.log(`Fetch Daily Word Error: ${error.message}`);
            throw utilities_1.errorUtilities.createError(`Error fetching daily word, please try again`, 500);
        }
    },
    getOneOldWord: async (filter, projection = null) => {
        try {
            let orderBy;
            if (filter.dateUsed === null) {
                orderBy = [['createdAt', 'ASC']];
            }
            else {
                orderBy = [['dateUsed', 'ASC']];
            }
            const oldWord = await wordForTheDay_1.default.findOne({
                where: filter,
                attributes: projection,
                order: orderBy,
                raw: true
            });
            return oldWord;
        }
        catch (error) {
            console.log(`Fetch Old Daily Word Error: ${error.message}`);
            throw utilities_1.errorUtilities.createError(`Error fetching old daily word, please try again`, 500);
        }
    },
};
exports.default = wordForTheDayRepositories;
