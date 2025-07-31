import { Transaction } from "sequelize";
declare const _default: {
    performTransaction: (operations: ((transaction: Transaction) => Promise<void>)[], database: any) => Promise<void>;
};
export default _default;
