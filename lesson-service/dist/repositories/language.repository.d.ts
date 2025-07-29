import { Transaction } from "sequelize";
import Languages from "../entities/language";
declare const languageRepositories: {
    getLanguages: (filter?: {
        isActive: boolean;
    }) => Promise<Languages[]>;
    getLanguage: (id: string) => Promise<Languages | null>;
    getLanguageByCode: (code: string) => Promise<Languages | null>;
    addLanguage: (languageData: any, transaction?: Transaction) => Promise<Languages>;
    updateLanguage: (languageData: any, transaction?: Transaction) => Promise<any>;
    deleteLanguage: (id: string) => Promise<{
        message: string;
    }>;
    toggleLanguageStatus: (id: string) => Promise<[affectedCount: number]>;
    addLanguageContent: (languageContentData: any) => Promise<any>;
};
export default languageRepositories;
