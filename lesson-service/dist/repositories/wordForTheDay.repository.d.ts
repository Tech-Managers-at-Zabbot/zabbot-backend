import { Transaction } from "sequelize";
import WordForTheDay from "../entities/wordForTheDay";
declare const wordForTheDayRepositories: {
    create: (data: any, transaction?: Transaction) => Promise<WordForTheDay>;
    updateOne: (filter: any, update: any, transaction?: Transaction) => Promise<any>;
    deleteOne: (filter: any) => Promise<WordForTheDay>;
    getOne: (filter: Record<string, any>, projection?: any) => Promise<WordForTheDay | null>;
    getOneOldWord: (filter: Record<string, any>, projection?: any) => Promise<WordForTheDay | null>;
};
export default wordForTheDayRepositories;
