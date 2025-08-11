"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CourseResponses = exports.DailyGoalResponses = exports.LanguageResponses = exports.DailyWordResponses = void 0;
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
    CourseResponses["COURSE_NOT_FOUND"] = "Course not found, please try again";
    CourseResponses["CONTENTS_NOT_FOUND"] = "Contents not found, please try again";
    CourseResponses["LESSONS_NOT_FOUND"] = "Lessons not found, please try again";
    CourseResponses["CONTENT_NOT_FOUND"] = "Content not found, please try again";
})(CourseResponses || (exports.CourseResponses = CourseResponses = {}));
