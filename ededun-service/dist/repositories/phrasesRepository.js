"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const phrasesModel_1 = __importDefault(require("../models/phrases/phrasesModel"));
const phrasesRepository = {
    create: async (data, transaction) => {
        try {
            const newPhrases = await phrasesModel_1.default.create(data, { transaction });
            return newPhrases;
        }
        catch (error) {
            throw new Error(`Error creating Phrases: ${error.message}`);
        }
    },
    updateOne: async (filter, update, transaction) => {
        try {
            const phrase = await phrasesModel_1.default.findOne({ where: filter });
            await phrase.update(update, { transaction });
            return phrase;
        }
        catch (error) {
            throw new Error(`Error updating Phrases: ${error.message}`);
        }
    },
    updateMany: async (filter, update) => {
        try {
            const [affectedRows] = await phrasesModel_1.default.update(update, { where: filter });
            return { affectedRows };
        }
        catch (error) {
            throw new Error(`Error updating Phrases: ${error.message}`);
        }
    },
    deleteOne: async (filter) => {
        try {
            const phrase = await phrasesModel_1.default.findOne({ where: filter });
            if (!phrase)
                throw new Error("Phrase not found");
            await phrase.destroy();
            return phrase;
        }
        catch (error) {
            throw new Error(`Error deleting Phrases: ${error.message}`);
        }
    },
    deleteMany: async (filter) => {
        try {
            const affectedRows = await phrasesModel_1.default.destroy({ where: filter });
            return { affectedRows };
        }
        catch (error) {
            throw new Error(`Error deleting Phrases: ${error.message}`);
        }
    },
    getOne: async (filter, projection = null) => {
        try {
            const phrase = await phrasesModel_1.default.findOne({
                where: filter,
                attributes: projection
            });
            return phrase;
        }
        catch (error) {
            throw new Error(`Error fetching Phrases: ${error.message}`);
        }
    },
    getMany: async (filter, projection, options, order) => {
        try {
            const phrases = await phrasesModel_1.default.findAll({
                where: filter,
                attributes: projection,
                ...options,
                order
            });
            return phrases;
        }
        catch (error) {
            throw new Error(`Error fetching Phrases: ${error.message}`);
        }
    },
};
exports.default = {
    phrasesRepository,
};
