"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FlashcardResponses = exports.QuizResponses = exports.UserLessonResponses = exports.ContentResponses = exports.CourseResponses = exports.DailyGoalResponses = exports.LanguageResponses = exports.DailyWordResponses = void 0;
var DailyWordResponses;
(function (DailyWordResponses) {
    DailyWordResponses["NOT_FOUND"] = "This word does not exist, please check and try again";
    DailyWordResponses["ALREADY_EXISTS"] = "This word already exists!";
    DailyWordResponses["UNABLE_TO_CREATE"] = "Unable to create daily word, please try again";
    DailyWordResponses["SUCCESSFULLY_CREATED"] = "Daily Word Created Successfully";
    DailyWordResponses["TODAY_WORD_NOT_FOUND"] = "Word for today not found. It may not have been picked yet.";
    DailyWordResponses["TODAY_WORD_FOUND"] = "Today's word retrieved successfully";
    DailyWordResponses["BULK_CREATION_DONE"] = "Bulk word creation processed";
    DailyWordResponses["REQUIRED_LANGUAGE_DATA"] = "Atlease one of language text or english text is required";
    DailyWordResponses["REQUIRED_LANGUAGE_CODE"] = "Language code is required";
    DailyWordResponses["NO_AVAILABLE_WORDS"] = "No available words found to assign for today";
    DailyWordResponses["PHRASES_ARRAY_NEEDED"] = "Phrases array must be provided and cannot be empty";
})(DailyWordResponses || (exports.DailyWordResponses = DailyWordResponses = {}));
var LanguageResponses;
(function (LanguageResponses) {
    LanguageResponses["NOT_FOUND"] = "This language does not exist, please check and try again";
})(LanguageResponses || (exports.LanguageResponses = LanguageResponses = {}));
var DailyGoalResponses;
(function (DailyGoalResponses) {
    DailyGoalResponses["SUCCESSFULLY_CREATED"] = "Daily goal created successfully";
    DailyGoalResponses["SUCCESSFUL_FETCH"] = "Daily goal fetched successfully";
    DailyGoalResponses["SUCCESSFUL_PROCESS"] = "Process successful";
    DailyGoalResponses["GOAL_ALREADY_COMPLETED"] = "Goal Completed already";
})(DailyGoalResponses || (exports.DailyGoalResponses = DailyGoalResponses = {}));
var CourseResponses;
(function (CourseResponses) {
    CourseResponses["COURSES_NOT_FETCHED"] = "Unable to fetch courses, try again";
    CourseResponses["PROCESS_SUCCESSFUL"] = "Process Successful";
    CourseResponses["USER_COURSE_NOT_FOUND"] = "User course not found";
    CourseResponses["USER_ENROLLED_FOR_COURSE"] = "User already enrolled in this course";
    CourseResponses["COURSE_NOT_FOUND"] = "Course not found, please try again";
    CourseResponses["CONTENTS_NOT_FOUND"] = "Contents not found, please try again";
    CourseResponses["LESSONS_NOT_FOUND"] = "Lessons not found, please try again";
    CourseResponses["LESSON_NOT_FOUND"] = "Lesson not found.";
    CourseResponses["CONTENT_NOT_FOUND"] = "Content not found, please try again";
    CourseResponses["PROCESS_UNSUCCESSFUL"] = "Process unsuccessful, please try again";
    CourseResponses["PROCESS_COMPLETED"] = "Process completed";
})(CourseResponses || (exports.CourseResponses = CourseResponses = {}));
var ContentResponses;
(function (ContentResponses) {
    ContentResponses["CONTENTS_NOT_FETCHED"] = "Unable to fetch contents, try again";
    ContentResponses["PROCESS_SUCCESSFUL"] = "Process Successful";
})(ContentResponses || (exports.ContentResponses = ContentResponses = {}));
var UserLessonResponses;
(function (UserLessonResponses) {
    UserLessonResponses["PROCESS_SUCCESSFUL"] = "Process Successful";
    UserLessonResponses["USER_LESSON_CREATED"] = "User lesson created successfully";
    UserLessonResponses["USER_LESSON_UPDATED"] = "User lesson updated successfully";
    UserLessonResponses["USER_LESSON_DELETED"] = "User lesson deleted successfully";
    UserLessonResponses["USER_LESSON_NOT_FOUND"] = "User lesson not found";
    UserLessonResponses["FIRST_ATTEMPT_ALREADY_TRACKED"] = "This lesson has already been tracked for the user";
    UserLessonResponses["REQUIRED_FIELDS"] = "courseId, lessonId and languageId are required";
    UserLessonResponses["LESSON_NOT_IN_COURSE"] = "Lesson does not belong to this course";
    UserLessonResponses["LESSON_NOT_IN_LANGUAGE"] = "Lesson does not belong to this language";
})(UserLessonResponses || (exports.UserLessonResponses = UserLessonResponses = {}));
var QuizResponses;
(function (QuizResponses) {
    QuizResponses["QUIZ_NOT_FOUND"] = "Quiz not found, please try again";
    QuizResponses["QUIZZES_NOT_FOUND"] = "Quizzes not found for this course";
    QuizResponses["QUIZ_ALREADY_EXISTS"] = "Quiz already exists for this course and language";
    QuizResponses["QUIZ_CREATED_SUCCESSFULLY"] = "Quiz created successfully";
    QuizResponses["QUIZ_UPDATED_SUCCESSFULLY"] = "Quiz updated successfully";
    QuizResponses["QUIZ_DELETED_SUCCESSFULLY"] = "Quiz deleted successfully";
    QuizResponses["QUIZ_SUBMITTED_SUCCESSFULLY"] = "Quiz submitted successfully";
    QuizResponses["QUIZ_SUBMISSION_FAILED"] = "Quiz submission failed, please try again";
    QuizResponses["SUCCESSFUL_PROCESS"] = "Process successful";
})(QuizResponses || (exports.QuizResponses = QuizResponses = {}));
var FlashcardResponses;
(function (FlashcardResponses) {
    FlashcardResponses["FLASHCARD_NOT_FOUND"] = "Flashcard not found, please try again";
    FlashcardResponses["FLASHCARD_CREATED_SUCCESSFULLY"] = "Flashcard created successfully";
    FlashcardResponses["FLASHCARD_UPDATED_SUCCESSFULLY"] = "Flashcard updated successfully";
    FlashcardResponses["FLASHCARD_DELETED_SUCCESSFULLY"] = "Flashcard deleted successfully";
    FlashcardResponses["SUCCESSFUL_PROCESS"] = "Process successful";
})(FlashcardResponses || (exports.FlashcardResponses = FlashcardResponses = {}));
