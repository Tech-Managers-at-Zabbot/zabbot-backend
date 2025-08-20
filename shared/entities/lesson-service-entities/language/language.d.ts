import { Model } from 'sequelize';
import { LanguageAttributes } from '../../../databaseTypes/lesson-service-types';
declare class Languages extends Model<LanguageAttributes> implements LanguageAttributes {
    id: string;
    title: string;
    code: string;
    isActive?: boolean;
    flagIcon?: string;
}
export default Languages;
