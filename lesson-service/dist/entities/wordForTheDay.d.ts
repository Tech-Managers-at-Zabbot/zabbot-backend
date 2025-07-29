import { Model } from 'sequelize';
import { DailyWordAttributes } from '../data-types/interface';
declare class WordForTheDay extends Model<DailyWordAttributes> implements DailyWordAttributes {
    id: string;
    languageId: string;
    dateUsed: Date;
    isActive: boolean;
    audioUrls: string[];
    languageText: string;
    englishText: string;
    isUsed: boolean;
    pronunciationNote?: string;
}
export default WordForTheDay;
