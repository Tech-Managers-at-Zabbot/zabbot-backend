import { Model } from 'sequelize';
import { ContentFileAttributes } from '../data-types/interface';
import { ContentDataType } from '../data-types/enums';
declare class ContentFiles extends Model<ContentFileAttributes> implements ContentFileAttributes {
    id?: string;
    contentId: string;
    contentType: ContentDataType;
    filePath?: string;
    createdAt: Date;
    description?: string;
}
export default ContentFiles;
