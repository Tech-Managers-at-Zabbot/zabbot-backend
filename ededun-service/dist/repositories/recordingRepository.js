"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const recordingModel_1 = __importDefault(require("../models/recordings/recordingModel"));
const recordingRepository = {
    create: async (data, transaction) => {
        try {
            const newRecording = await recordingModel_1.default.create(data, { transaction });
            return newRecording;
        }
        catch (error) {
            throw new Error(`Error creating recording: ${error.message}`);
        }
    },
    updateOne: async (filter, update, transaction) => {
        try {
            const recording = await recordingModel_1.default.findOne({ where: filter });
            await recording.update(update, { transaction });
            return recording;
        }
        catch (error) {
            throw new Error(`Error updating recording: ${error.message}`);
        }
    },
    updateMany: async (filter, update) => {
        try {
            const [affectedRows] = await recordingModel_1.default.update(update, { where: filter });
            return { affectedRows };
        }
        catch (error) {
            throw new Error(`Error updating Recordings: ${error.message}`);
        }
    },
    deleteOne: async (filter) => {
        try {
            const recording = await recordingModel_1.default.findOne({ where: filter });
            if (!recording)
                throw new Error("Recording not found");
            await recording.destroy();
            return recording;
        }
        catch (error) {
            throw new Error(`Error deleting Recording: ${error.message}`);
        }
    },
    deleteMany: async (filter) => {
        try {
            const affectedRows = await recordingModel_1.default.destroy({ where: filter });
            return { affectedRows };
        }
        catch (error) {
            throw new Error(`Error deleting Recordings: ${error.message}`);
        }
    },
    getOne: async (filter, projection = null) => {
        try {
            const recording = await recordingModel_1.default.findOne({
                where: filter,
                attributes: projection,
                raw: true
            });
            return recording;
        }
        catch (error) {
            throw new Error(`Error fetching Recording: ${error.message}`);
        }
    },
    getMany: async (filter, projection, options, order) => {
        try {
            const recordings = await recordingModel_1.default.findAll({
                where: filter,
                attributes: projection,
                raw: true,
                ...options,
                order
            });
            return recordings;
        }
        catch (error) {
            throw new Error(`Error fetching Recordings: ${error.message}`);
        }
    },
};
exports.default = {
    recordingRepository,
};
