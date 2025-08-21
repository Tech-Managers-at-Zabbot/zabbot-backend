import { Model } from 'sequelize';
import { ContentDataType, ContentFileAttributes } from '../../../databaseTypes/lesson-service-types';
declare class ContentFiles extends Model<ContentFileAttributes> implements ContentFileAttributes {
    id?: string;
    contentId: string;
    contentType: ContentDataType;
    filePath?: string;
    createdAt: Date;
    description?: string;
}
export default ContentFiles;
