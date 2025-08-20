import { Model } from "sequelize";
import { ReferencePronunciationAttributes } from "../../../databaseTypes/pronunciation-feedback-types";
declare class ReferencePronunciation extends Model<ReferencePronunciationAttributes> implements ReferencePronunciationAttributes {
    id: string;
    word: string;
    englishWord: string;
    yorubaWord: string;
    femaleVoice: string;
    maleVoice: string;
    tone: string;
}
export default ReferencePronunciation;
