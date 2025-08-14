import { Transaction } from "sequelize";
import ReferencePronunciation from "../entities/reference-pronunciation";
declare const referenePronunciationRepositories: {
    getPronunciation: (id: string) => Promise<ReferencePronunciation | null>;
    getPronunciations: () => Promise<ReferencePronunciation[]>;
    addPronunciation: (pronunciationData: any, transaction?: Transaction) => Promise<ReferencePronunciation>;
    updatePronunciation: (pronunciationData: any, transaction?: Transaction) => Promise<any>;
    deletePronunciation: (id: string, transaction?: Transaction) => Promise<{
        message: string;
    }>;
};
export default referenePronunciationRepositories;
