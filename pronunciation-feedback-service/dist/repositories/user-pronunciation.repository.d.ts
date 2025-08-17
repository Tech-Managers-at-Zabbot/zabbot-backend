import { Transaction } from "sequelize";
import UserPronunciation from "../entities/user-pronunciation";
declare const userPronunciationRepositories: {
    getPronunciation: (id: string) => Promise<UserPronunciation | null>;
    getPronunciations: () => Promise<UserPronunciation[]>;
    addPronunciation: (pronunciationData: any, transaction?: Transaction) => Promise<UserPronunciation>;
    updatePronunciation: (pronunciationData: any, transaction?: Transaction) => Promise<any>;
    deletePronunciation: (id: string, transaction?: Transaction) => Promise<{
        message: string;
    }>;
};
export default userPronunciationRepositories;
