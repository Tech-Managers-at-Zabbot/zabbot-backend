"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const utilities_1 = require("../../../shared/utilities");
const reference_pronunciation_1 = __importDefault(require("../../../shared/entities/pronunciation-feedback-service-entities/referencePronunciation/reference-pronunciation"));
const referenePronunciationRepositories = {
    getPronunciation: async (id) => {
        try {
            const pronunciation = await reference_pronunciation_1.default.findByPk(id);
            return pronunciation;
        }
        catch (error) {
            throw utilities_1.errorUtilities.createError(`Error Fetching pronunciation: ${error.message}`, 500);
        }
    },
    getPronunciations: async () => {
        try {
            const pronunciations = await reference_pronunciation_1.default.findAll();
            return pronunciations;
        }
        catch (error) {
            throw utilities_1.errorUtilities.createError(`Error Fetching pronunciations: ${error.message}`, 500);
        }
    },
    addPronunciation: async (pronunciationData, transaction) => {
        try {
            // Create a new pronunciation
            const newPronunciation = await reference_pronunciation_1.default.create(pronunciationData, { transaction });
            return newPronunciation;
        }
        catch (error) {
            throw utilities_1.errorUtilities.createError(`Error Adding pronunciation: ${error.message}`, 500);
        }
    },
    updatePronunciation: async (pronunciationData, transaction) => {
        try {
            await pronunciationData.update(pronunciationData, { transaction });
            return pronunciationData;
        }
        catch (error) {
            throw utilities_1.errorUtilities.createError(`Error Updating pronunciation: ${error.message}`, 500);
        }
    },
    deletePronunciation: async (id, transaction) => {
        try {
            await reference_pronunciation_1.default.destroy({
                where: { id },
                transaction,
            });
            return { message: "Pronunciation deleted successfully" };
        }
        catch (error) {
            throw utilities_1.errorUtilities.createError(`Error Deleting pronunciation: ${error.message}`, 500);
        }
    },
};
exports.default = referenePronunciationRepositories;
