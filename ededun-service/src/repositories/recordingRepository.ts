import { Transaction } from "sequelize";
import Recordings from "../models/recordings/recordingModel";

const recordingRepository = {

  create: async (data: any, transaction?:Transaction) => {
    try {
      const newRecording = await Recordings.create(data, { transaction });
      return newRecording;
    } catch (error: any) {
      throw new Error(`Error creating recording: ${error.message}`);
    }
  },

  updateOne: async (filter: any, update: any, transaction?: Transaction) => {
    try {
      const recording:any = await Recordings.findOne({ where: filter });
      await recording.update(update, { transaction });
      return recording;
    } catch (error: any) {
      throw new Error(`Error updating recording: ${error.message}`);
    }
  },
  

  updateMany: async (filter: any, update: any) => {
    try {
      const [affectedRows] = await Recordings.update(update, { where: filter });
      return { affectedRows };
    } catch (error: any) {
      throw new Error(`Error updating Recordings: ${error.message}`);
    }
  },

  deleteOne: async (filter: any) => {
    try {
      const recording = await Recordings.findOne({ where: filter });
      if (!recording) throw new Error("Recording not found");
      await recording.destroy();
      return recording;
    } catch (error: any) {
      throw new Error(`Error deleting Recording: ${error.message}`);
    }
  },

  deleteMany: async (filter: any) => {
    try {
      const affectedRows = await Recordings.destroy({ where: filter });
      return { affectedRows };
    } catch (error: any) {
      throw new Error(`Error deleting Recordings: ${error.message}`);
    }
  },

  getOne: async (filter: Record<string, any>, projection: any = null) => {
    try {
      const recording = await Recordings.findOne({
        where: filter,
        attributes: projection
      });
      return recording;
    } catch (error: any) {
      throw new Error(`Error fetching Recording: ${error.message}`);
    }
  },
  

  getMany: async (filter: any, projection?: any, options?: any, order?:any) => {
    try {
      const recordings = await Recordings.findAll({
        where: filter,
        attributes: projection,
        ...options,
        order
      });
      return recordings;
    } catch (error: any) {
      throw new Error(`Error fetching Recordings: ${error.message}`);
    }
  },
  
};

export default {
  recordingRepository,
};
