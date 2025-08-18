import Otp from "../../../../shared/entities/user-service-entities/otp/otp.entities";
import { Transaction } from "sequelize";
import { errorUtilities } from "../../../../shared/utilities";

const otpRepositories = {
  create: async (data: any, transaction?: Transaction) => {
    try {
      const newOtp = await Otp.create(data, { transaction });
      return newOtp;
    } catch (error: any) {
      console.log(`Create OTP Error: ${error.message}`);
      throw errorUtilities.createError(`Error creating OTP, please try again`, 500);
    }
  },

  getByPK: async (id: string) => {
    try {
      const otp = await Otp.findByPk(id);
      return otp;
    } catch (error: any) {
      console.log(`Fetch OTP by PK Error: ${error.message}`);
      throw errorUtilities.createError(`Error fetching OTP, please try again`, 500);
    }
  },

  getOne: async (filter: any, projection:any = null) => {
    try {
      const otp = await Otp.findOne({ 
        where: filter, 
        attributes: projection,
        raw: true
      });

      if (!otp) throw errorUtilities.createError("OTP not found", 404);
      return otp;
    }catch (error: any) {
      console.log(`Fetch OTP Error: ${error.message}`);
      throw errorUtilities.createError(`Error fetching OTP: ${error.message}`, 500);
    }
  },

  getLatestOtp: async (filter: any, projection: any = null) => {
  try {
    const otp = await Otp.findOne({ 
      where: filter, 
      attributes: projection,
      order: [['createdAt', 'DESC']],
      raw: true
    });

    if (!otp) throw errorUtilities.createError("Latest OTP not found", 404);
    return otp;
  } catch (error: any) {
    console.log(`Fetch Latest OTP Error: ${error.message}`);
    throw errorUtilities.createError(`Error fetching latest OTP: ${error.message}`, 500);
  }
},

  updateOne: async (filter: any, update: any, transaction?: Transaction) => {
    try {
      const otp: any = await Otp.findOne({ where: filter });
      await otp.update(update, { transaction });
      return otp;
    } catch (error: any) {
      throw errorUtilities.createError(`Error updating OTP: ${error.message}`, 400);
    }
  },

  deleteOne: async (filter: any) => {
    try {
      const otp = await Otp.findOne({ where: filter });
      if (!otp) throw new Error("OTP not found");
      await otp.destroy();
      return otp;
    } catch (error: any) {
      throw errorUtilities.createError(`Error deleting OTP: ${error.message}`, 400);
    }
  },
};


export default otpRepositories;