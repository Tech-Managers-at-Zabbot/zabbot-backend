import { Model } from "sequelize";
import { ContentAttributes, GrammarExample } from "../../../databaseTypes/lesson-service-types";
declare class Contents extends Model<ContentAttributes> implements ContentAttributes {
    id: string;
    lessonId: string;
    languageId: string;
    translation?: string;
    contentType: string;
    proverb?: string;
    createdAt?: Date;
    updatedAt?: Date;
    isGrammarRule?: boolean;
    sourceType: string;
    customText?: string;
    grammarTitle?: string;
    grammarSubtitle?: string;
    grammarDescription?: string[];
    grammarExamples?: GrammarExample[];
    ededunPhrases?: string;
}
export default Contents;
