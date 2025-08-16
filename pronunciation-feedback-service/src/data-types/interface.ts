export interface ReferencePronunciationAttributes {
  id: string;
  englishWord: string;
  yorubaWord: string;
  maleVoice: string;
  tone: string;
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
