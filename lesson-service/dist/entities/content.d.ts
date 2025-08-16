import { Model } from 'sequelize';
import { ContentAttributes } from '../data-types/interface';
declare class Contents extends Model<ContentAttributes> implements ContentAttributes {
    id: string;
    lessonId: string;
    languageId: string;
    translation?: string;
    createdAt?: Date;
    updatedAt?: Date;
    isGrammarRule?: boolean;
    sourceType: string;
    customText?: string;
    ededunPhrases?: string;
}
export default Contents;
