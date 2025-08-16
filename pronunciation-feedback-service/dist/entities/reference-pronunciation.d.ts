import { Model } from "sequelize";
import { ReferencePronunciationAttributes } from "../data-types/interface";
declare class ReferencePronunciation extends Model<ReferencePronunciationAttributes> implements ReferencePronunciationAttributes {
    id: string;
    word: string;
    femaleVoice: string;
    maleVoice: string;
}
export default ReferencePronunciation;
