import { Model } from 'sequelize';
import { ContentAttributes } from '../data-types/interface';
<<<<<<< HEAD
import { Level } from "../data-types/enums";
declare class Contents extends Model<ContentAttributes> implements ContentAttributes {
    id: string;
    lessonId: string;
    languageContentId: string;
    translation?: string;
    level: Level;
    createdAt: Date;
    updatedAt?: Date;
=======
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
>>>>>>> 2f02c363aeb6a6515fd726c55e0d04a284f89bdb
}
export default Contents;
