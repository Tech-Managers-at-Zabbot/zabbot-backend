import Transactions from "../../../../shared/entities/payment-service-entities/transactions/transactions";
import { Transaction } from "sequelize";
import { errorUtilities } from "../../../../shared/utilities";

const transactionsRepositories = {
  create: async (data: any, transaction?: Transaction) => {
    try {
      const newTransaction = await Transactions.create(data, { transaction });
      return newTransaction;
    } catch (error: any) {
      console.log(`Create Transaction Error: ${error.message}`);
      throw errorUtilities.createError(
        `Error creating transaction, please try again`,
        500
      );
    }
  },

  getByPK: async (id: string) => {
    try {
      const user = await Transactions.findByPk(id);
      return user;
    } catch (error: any) {
      console.log(`Fetch User by Error: ${error.message}`);
      throw errorUtilities.createError(
        `Error Fetching user, please try again`,
        500
      );
    }
  },

  updateOne: async (filter: any, update: any, transaction?: Transaction) => {
    try {
      const user: any = await Transactions.findOne({ where: filter });
      await user.update(update, { transaction });
      return user;
    } catch (error: any) {
      throw errorUtilities.createError(
        `Error updating User: ${error.message}`,
        400
      );
    }
  },

  updateMany: async (filter: any, update: any) => {
    try {
      const [affectedRows] = await Transactions.update(update, {
        where: filter,
      });
      return { affectedRows };
    } catch (error: any) {
      throw new Error(`Error updating Users: ${error.message}`);
    }
  },

  deleteOne: async (filter: any) => {
    try {
      const user = await Transactions.findOne({ where: filter });
      if (!user) throw new Error("User not found");
      await user.destroy();
      return user;
    } catch (error: any) {
      throw new Error(`Error deleting User: ${error.message}`);
    }
  },

  deleteMany: async (filter: any) => {
    try {
      const affectedRows = await Transactions.destroy({ where: filter });
      return { affectedRows };
    } catch (error: any) {
      throw new Error(`Error deleting Users: ${error.message}`);
    }
  },

  getOne: async (filter: Record<string, any>, projection: any = null, order?:any) => {
    try {
      const transaction = await Transactions.findOne({
        where: filter,
        attributes: projection,
        order,
        raw: true,
      });
      return transaction;
    } catch (error: any) {
      console.log(`Fetch Transaction Error: ${error.message}`);
      throw errorUtilities.createError(
        `Error fetching transaction, please try again`,
        500
      );
    }
  },

  getAllCount: async () => {
    try {
      const { count } = await Transactions.findAndCountAll({});
      return count;
    } catch (error: any) {
      console.log(`Count users error: ${error.message}`);
    }
  },

  getMany: async (
    filter: any,
    projection?: any,
    options?: any,
    order?: any
  ) => {
    try {
      const transactions = await Transactions.findAll({
        where: filter,
        attributes: projection,
        ...options,
        order,
        raw: true,
      });
      return transactions;
    } catch (error: any) {
      throw new Error(`Error fetching Transactions: ${error.message}`);
    }
  },

//   extractUserDetails: async (userData: Record<string, any>) => {
//     try {
//       return {
//         email: userData.email,
//         firstName: userData.firstName,
//         lastName: userData.lastName,
//         role: userData.role,
//         id: userData.id,
//         isFirstTimeLogin: userData.isFirstTimeLogin,
//         isVerified: userData.isVerified,
//         isActive: userData.isActive,
//         isBlocked: userData.isBlocked,
//         verifiedAt: userData.verifiedAt,
//         registerMethod: userData.registerMethod,
//         country: userData.country,
//         phoneNumber: userData.phoneNumber,
//         deletedAt: userData.deletedAt,
//         profilePicture: userData.profilePicture,
//         bio: userData.bio,
//         dateOfBirth: userData.dateOfBirth,
//         address: userData.address,
//         socialLinks: userData.socialLinks,
//         preferences: userData.preferences,
//         lastLoginAt: userData.lastLoginAt,
//         lastPasswordChangeAt: userData.lastPasswordChangeAt,
//         twoFactorEnabled: userData.twoFactorEnabled,
//         securityQuestions: userData.securityQuestions,
//       };
//     } catch (error: any) {
//       throw new Error(`Error fetching User(s): ${error.message}`);
//     }
//   },
};

export default transactionsRepositories;
