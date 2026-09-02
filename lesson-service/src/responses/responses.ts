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
  NO_AVAILABLE_WORDS = "No available words found to assign for today",
  PHRASES_ARRAY_NEEDED = "Phrases array must be provided and cannot be empty",
}

export enum LanguageResponses {
  NOT_FOUND = "This language does not exist, please check and try again",
}

export enum DailyGoalResponses {
  SUCCESSFULLY_CREATED = "Daily goal created successfully",
  SUCCESSFUL_FETCH = "Daily goal fetched successfully",
  SUCCESSFUL_PROCESS = "Process successful",
  GOAL_ALREADY_COMPLETED = "Goal Completed already",
}

export enum CourseResponses {
  COURSES_NOT_FETCHED = "Unable to fetch courses, try again",
  PROCESS_SUCCESSFUL = "Process Successful",
  USER_COURSE_NOT_FOUND = "User course not found",
  USER_ENROLLED_FOR_COURSE = "User already enrolled in this course",
  COURSE_NOT_FOUND = "Course not found, please try again",
  CONTENTS_NOT_FOUND = "Contents not found, please try again",
  LESSONS_NOT_FOUND = "Lessons not found, please try again",
  LESSON_NOT_FOUND = "Lesson not found.",
  CONTENT_NOT_FOUND = "Content not found, please try again",
  PROCESS_UNSUCCESSFUL = "Process unsuccessful, please try again",
  PROCESS_COMPLETED = "Process completed",
}

export enum ContentResponses {
  CONTENTS_NOT_FETCHED = "Unable to fetch contents, try again",
  PROCESS_SUCCESSFUL = "Process Successful",
}

export enum UserLessonResponses {
  PROCESS_SUCCESSFUL = "Process Successful",
  USER_LESSON_CREATED = "User lesson created successfully",
  USER_LESSON_UPDATED = "User lesson updated successfully",
  USER_LESSON_DELETED = "User lesson deleted successfully",
  USER_LESSON_NOT_FOUND = "User lesson not found",
  FIRST_ATTEMPT_ALREADY_TRACKED = "This lesson has already been tracked for the user",
  REQUIRED_FIELDS = "courseId, lessonId and languageId are required",
  LESSON_NOT_IN_COURSE = "Lesson does not belong to this course",
  LESSON_NOT_IN_LANGUAGE = "Lesson does not belong to this language",
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

export enum FlashcardResponses {
  FLASHCARD_NOT_FOUND = "Flashcard not found, please try again",
  FLASHCARD_CREATED_SUCCESSFULLY = "Flashcard created successfully",
  FLASHCARD_UPDATED_SUCCESSFULLY = "Flashcard updated successfully",
  FLASHCARD_DELETED_SUCCESSFULLY = "Flashcard deleted successfully",
  SUCCESSFUL_PROCESS = "Process successful",
}
