import { Model } from "sequelize";
import { UserPronunciationAttributes } from "../data-types/interface";
declare class UserPronunciation extends Model<UserPronunciationAttributes> implements UserPronunciationAttributes {
    id: string;
    userId: string;
    pronunciationId: string;
    recordingUrl: string;
    pronuciationPlotUrl: string;
}
export default UserPronunciation;
