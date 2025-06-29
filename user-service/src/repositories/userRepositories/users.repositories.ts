import Users from "../../entities/users.entities";
import { Transaction } from "sequelize";
import { errorUtilities } from "../../../../shared/utilities";

const userRepositories = {

  create: async (data: any, transaction?: Transaction) => {
    try {
      const newUser = await Users.create(data, { transaction });
      return newUser;
    } catch (error: any) {
      console.log(`Create User Error: ${error.message}`)
      throw errorUtilities.createError(`Error registering user, please try again`, 500);
    }
  },

  getByPK: async (id: string) => {
    try {
      const user = await Users.findByPk(id);
      return user;
    } catch (error: any) {
      console.log(`Fetch User by Error: ${error.message}`)
      throw errorUtilities.createError(`Error Fetching user, please try again`, 500);
    }
  },

  updateOne: async (filter: any, update: any, transaction?: Transaction) => {
    try {
      const user: any = await Users.findOne({ where: filter });
      await user.update(update, { transaction });
      return user;
    } catch (error: any) {
      throw errorUtilities.createError(`Error updating User: ${error.message}`, 400);
    }
  },


  updateMany: async (filter: any, update: any) => {
    try {
      const [affectedRows] = await Users.update(update, { where: filter });
      return { affectedRows };
    } catch (error: any) {
      throw new Error(`Error updating Users: ${error.message}`);
    }
  },

  deleteOne: async (filter: any) => {
    try {
      const user = await Users.findOne({ where: filter });
      if (!user) throw new Error("User not found");
      await user.destroy();
      return user;
    } catch (error: any) {
      throw new Error(`Error deleting User: ${error.message}`);
    }
  },

  deleteMany: async (filter: any) => {
    try {
      const affectedRows = await Users.destroy({ where: filter });
      return { affectedRows };
    } catch (error: any) {
      throw new Error(`Error deleting Users: ${error.message}`);
    }
  },

  getOne: async (filter: Record<string, any>, projection: any = null) => {
    try {
      const user = await Users.findOne({
        where: filter,
        attributes: projection,
        raw: true
      });
      return user;
    } catch (error: any) {
      console.log(`Fetch User Error: ${error.message}`)
      throw errorUtilities.createError(`Error fetching user, please try again`, 500);
    }
  },


  getMany: async (filter: any, projection?: any, options?: any, order?: any) => {
    try {
      const users = await Users.findAll({
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
        id: userData.id,
        isFirstTimeLogin: userData.isFirstTimeLogin,
        isVerified: userData.isVerified,
        isActive: userData.isActive,
        isBlocked: userData.isBlocked,
        verifiedAt: userData.verifiedAt,
        registerMethod: userData.registerMethod,
        country: userData.country,
        phoneNumber: userData.phoneNumber,
        deletedAt: userData.deletedAt,
        profilePicture: userData.profilePicture,
        bio: userData.bio,
        dateOfBirth: userData.dateOfBirth,
        address: userData.address,
        socialLinks: userData.socialLinks,
        preferences: userData.preferences,
        lastLoginAt: userData.lastLoginAt,
        lastPasswordChangeAt: userData.lastPasswordChangeAt,
        twoFactorEnabled: userData.twoFactorEnabled,
        securityQuestions: userData.securityQuestions,
      };
    } catch (error: any) {
      throw new Error(`Error fetching User(s): ${error.message}`);
    }
  },

};

export default userRepositories
