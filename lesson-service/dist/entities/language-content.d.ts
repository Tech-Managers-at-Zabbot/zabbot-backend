import { Model } from 'sequelize';
import { LanguageContentAtrributes } from '../data-types/interface';
declare class LanguageContents extends Model<LanguageContentAtrributes> implements LanguageContentAtrributes {
    id: string;
    languageId: string;
    title: string;
    word: string;
    tone: string;
    createdAt: Date;
    updatedAt?: Date;
}
export default LanguageContents;
