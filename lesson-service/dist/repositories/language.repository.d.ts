import { Transaction } from "sequelize";
import Languages from "../entities/language";
import LanguageContents from "../entities/language-content";
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
    getLanguageContents: () => Promise<LanguageContents[]>;
    getLanguageContent: (languageId: string) => Promise<LanguageContents>;
    addLanguageContent: (languageContentData: any) => Promise<LanguageContents>;
    updateLanguageContent: (id: string, languageContentData: any) => Promise<[affectedCount: number]>;
};
export default languageRepositories;
