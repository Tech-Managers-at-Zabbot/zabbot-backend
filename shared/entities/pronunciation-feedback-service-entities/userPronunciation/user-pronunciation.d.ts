import { Model } from "sequelize";
import { UserPronunciationAttributes } from "../../../databaseTypes/pronunciation-feedback-types";
declare class UserPronunciation extends Model<UserPronunciationAttributes> implements UserPronunciationAttributes {
    id: string;
    userId: string;
    pronunciationId: string;
    recordingUrl: string;
    pronuciationPlotUrl: string;
}
export default UserPronunciation;
