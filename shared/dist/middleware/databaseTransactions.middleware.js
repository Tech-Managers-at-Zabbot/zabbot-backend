"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// import { database } from "../configurations/database";
const performTransaction = async (operations, database) => {
    const sequelize = database;
    const transaction = await sequelize.transaction();
    try {
        for (const operation of operations) {
            await operation(transaction);
        }
        await transaction.commit();
        console.log("Transaction committed successfully");
    }
    catch (error) {
        await transaction.rollback();
        console.error("Transaction aborted due to an error:", error.message);
        throw new Error(`An error occured, please try again`);
    }
};
exports.default = {
    performTransaction,
};
