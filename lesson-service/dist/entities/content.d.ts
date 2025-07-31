import { Model } from 'sequelize';
import { ContentAttributes } from '../data-types/interface';
import { Level } from "../data-types/enums";
declare class Contents extends Model<ContentAttributes> implements ContentAttributes {
    id: string;
    lessonId: string;
    languageContentId: string;
    translation?: string;
    level: Level;
    createdAt: Date;
    updatedAt?: Date;
}
export default Contents;
