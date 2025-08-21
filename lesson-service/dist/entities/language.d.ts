import { Model } from 'sequelize';
import { LanguageAttributes } from '../data-types/interface';
declare class Languages extends Model<LanguageAttributes> implements LanguageAttributes {
    id: string;
    title: string;
    code: string;
    isActive?: boolean;
}
export default Languages;
