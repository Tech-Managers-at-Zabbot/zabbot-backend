export enum DailyWordResponses {
    NOT_FOUND = "This word does not exist, please check and try again",
    ALREADY_EXISTS = "This word already exists!",
    UNABLE_TO_CREATE = "Unable to create daily word, please try again",
    SUCCESSFULLY_CREATED = "Daily Word Created Successfully",
    TODAY_WORD_NOT_FOUND = "Word for today not found. It may not have been picked yet.",
    TODAY_WORD_FOUND = "Today's word retrieved successfully",
    BULK_CREATION_DONE = "Bulk word creation processed",
    REQUIRED_LANGUAGE_DATA = "Atlease one of language text or english text is required",
    REQUIRED_LANGUAGE_CODE = "Language code is required"
}


export enum LanguageResponses {
    NOT_FOUND = "This language does not exist, please check and try again",
}


export enum DailyGoalResponses {
    SUCCESSFULLY_CREATED = "Daily goal created successfully",
    SUCCESSFUL_FETCH = "Daily goal fetched successfully"
}