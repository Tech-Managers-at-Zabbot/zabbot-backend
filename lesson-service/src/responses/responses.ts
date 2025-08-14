export enum DailyWordResponses {
    NOT_FOUND = "This word does not exist, please check and try again",
    ALREADY_EXISTS = "This word already exists!",
    UNABLE_TO_CREATE = "Unable to create daily word, please try again",
    SUCCESSFULLY_CREATED = "Daily Word Created Successfully",
    TODAY_WORD_NOT_FOUND = "Word for today not found. It may not have been picked yet.",
    TODAY_WORD_FOUND = "Today's word retrieved successfully",
    BULK_CREATION_DONE = "Bulk word creation processed",
    REQUIRED_LANGUAGE_DATA = "Atlease one of language text or english text is required",
    REQUIRED_LANGUAGE_CODE = "Language code is required",
    NO_AVAILABLE_WORDS="No available words found to assign for today",
    PHRASES_ARRAY_NEEDED = "Phrases array must be provided and cannot be empty"
}


export enum LanguageResponses {
    NOT_FOUND = "This language does not exist, please check and try again",
}


export enum DailyGoalResponses {
    SUCCESSFULLY_CREATED = "Daily goal created successfully",
    SUCCESSFUL_FETCH = "Daily goal fetched successfully",
    SUCCESSFUL_PROCESS = "Process successful",
    GOAL_ALREADY_COMPLETED = "Goal Completed already"
}

export enum CourseResponses {
    COURSES_NOT_FETCHED = "Unable to fetch courses, try again",
    PROCESS_SUCCESSFUL = "Process Successful",
    USER_COURSE_NOT_FOUND = "User course not found",
    COURSE_NOT_FOUND = "Course not found, please try again",
    CONTENTS_NOT_FOUND = "Contents not found, please try again",
    LESSONS_NOT_FOUND = "Lessons not found, please try again",
    CONTENT_NOT_FOUND = "Content not found, please try again",
    PROCESS_UNSUCCESSFUL = "Process unsuccessful, please try again",
    PROCESS_COMPLETED = "Process completed",
}

export enum QuizResponses {
    QUIZ_NOT_FOUND = "Quiz not found, please try again",
    QUIZZES_NOT_FOUND = "Quizzes not found for this course",
    QUIZ_ALREADY_EXISTS = "Quiz already exists for this course and language",
    QUIZ_CREATED_SUCCESSFULLY = "Quiz created successfully",
    QUIZ_UPDATED_SUCCESSFULLY = "Quiz updated successfully",
    QUIZ_DELETED_SUCCESSFULLY = "Quiz deleted successfully",
    QUIZ_SUBMITTED_SUCCESSFULLY = "Quiz submitted successfully",
    QUIZ_SUBMISSION_FAILED = "Quiz submission failed, please try again",
    SUCCESSFUL_PROCESS = "Process successful",
}