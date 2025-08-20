import { Transaction } from "sequelize";
import User from "../models/users/usersModel";
import { errorUtilities } from "../utilities";

const userRepositories = {

  create: async (data: any, transaction?:Transaction) => {
    try {
      const newUser = await User.create(data, { transaction });
      return newUser;
    } catch (error: any) {
      throw new Error(`Error creating User: ${error.message}`);
    }
  },

  updateOne: async (filter: any, update: any, transaction?: Transaction) => {
    try {
      const user:any = await User.findOne({ where: filter });
      await user.update(update, { transaction });
      return user;
    } catch (error: any) {
      throw new Error(`Error updating User: ${error.message}`);
    }
  },
  

  updateMany: async (filter: any, update: any) => {
    try {
      const [affectedRows] = await User.update(update, { where: filter });
      return { affectedRows };
    } catch (error: any) {
      throw new Error(`Error updating Users: ${error.message}`);
    }
  },

  deleteOne: async (filter: any) => {
    try {
      const user = await User.findOne({ where: filter });
      if (!user) throw new Error("User not found");
      await user.destroy();
      return user;
    } catch (error: any) {
      throw new Error(`Error deleting User: ${error.message}`);
    }
  },

  deleteMany: async (filter: any) => {
    try {
      const affectedRows = await User.destroy({ where: filter });
      return { affectedRows };
    } catch (error: any) {
      throw new Error(`Error deleting Users: ${error.message}`);
    }
  },

  getOne: async (filter: Record<string, any>, projection: any = null) => {
    try {
      const user = await User.findOne({
        where: filter,
        attributes: projection
      });
      return user;
    } catch (error: any) {
      throw new Error(`Error fetching User: ${error.message}`);
    }
  },
  

  getMany: async (filter: any, projection?: any, options?: any, order?:any) => {
    try {
      const users = await User.findAll({
        where: filter,
        attributes: projection,
        ...options,
        order
      });
      return users;
    } catch (error: any) {
      throw new Error(`Error fetching Users: ${error.message}`);
    }
  },

  extractUserDetails: async (userData: Record<string, any>) => {
    try {
      return {
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        role: userData.role,
        phone: userData.phone,
        refreshToken: userData.refreshToken,
        id:userData.id
      };
    } catch (error: any) {
      throw new Error(`Error fetching User(s): ${error.message}`);
    }
  },
  
};

export default {
  userRepositories,
};
