import { Model } from "sequelize";
import { FlashcardAttributes, IconAttribution } from "../../../databaseTypes/lesson-service-types";
declare class Flashcards extends Model<FlashcardAttributes> implements FlashcardAttributes {
    id: string;
    language: string;
    yorubaWord: string;
    englishWord: string;
    transcription: string;
    tonal: string;
    image: string;
    audio: string[];
    iconAttributions: IconAttribution;
    createdAt: Date;
    updatedAt?: Date;
}
export default Flashcards;
