export interface ReferencePronunciationAttributes {
    id: string;
    english_word: string;
    yoruba_word: string;
    maleVoice: string;
    femaleVoice: string;
    createdAt?: Date;
    updatedAt?: Date;
}
export interface UserPronunciationAttributes {
    id: string;
    userId: string;
    pronunciationId: string;
    recordingUrl: string;
    pronuciationPlotUrl: string;
}
