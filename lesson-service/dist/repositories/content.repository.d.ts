import Contents from "../entities/content";
import ContentFiles from "../entities/content-file";
import { Transaction } from "sequelize";
declare const contentRepositories: {
    getContents: () => Promise<Contents[]>;
    getContent: (id: string) => Promise<Contents | null>;
    getLessonContents: (lessonId: string) => Promise<Contents[]>;
    createContent: (contentData: any, transaction?: Transaction) => Promise<Contents>;
    updateContent: (contentData: any, transaction?: Transaction) => Promise<any>;
    deleteContent: (id: string) => Promise<{
        message: string;
    }>;
    getContentFiles: (contentId: string) => Promise<ContentFiles[]>;
    createContentFile: (contentFileData: any, transaction?: Transaction) => Promise<ContentFiles>;
};
export default contentRepositories;
