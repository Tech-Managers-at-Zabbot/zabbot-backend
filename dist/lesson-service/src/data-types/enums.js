"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
<<<<<<< HEAD
exports.QuestionType = exports.LanguageCode = exports.Level = exports.ContentSourceType = exports.ContentDataType = void 0;
=======
exports.QuizType = exports.LanguageCode = exports.Level = exports.ContentSourceType = exports.ContentDataType = void 0;
>>>>>>> 2f02c363aeb6a6515fd726c55e0d04a284f89bdb
var ContentDataType;
(function (ContentDataType) {
    ContentDataType["VIDEO"] = "video";
    ContentDataType["AUDIO"] = "audio";
    ContentDataType["IMAGE"] = "image";
})(ContentDataType || (exports.ContentDataType = ContentDataType = {}));
var ContentSourceType;
(function (ContentSourceType) {
    ContentSourceType["NEW"] = "new";
    ContentSourceType["EDEDUN"] = "ededun";
})(ContentSourceType || (exports.ContentSourceType = ContentSourceType = {}));
var Level;
(function (Level) {
    Level["FOUNDATION"] = "foundation";
    Level["BUILDER"] = "builder";
    Level["EXPLORER"] = "explorer";
})(Level || (exports.Level = Level = {}));
var LanguageCode;
(function (LanguageCode) {
    LanguageCode["ENGLISH"] = "EN";
    LanguageCode["SPANISH"] = "ES";
    LanguageCode["FRENCH"] = "FR";
    LanguageCode["GERMAN"] = "DE";
    LanguageCode["ITALIAN"] = "IT";
    LanguageCode["PORTUGUESE"] = "PT";
    LanguageCode["MANDARIN"] = "ZH";
    LanguageCode["JAPANESE"] = "JA";
    LanguageCode["KOREAN"] = "KO";
    LanguageCode["ARABIC"] = "AR";
    LanguageCode["RUSSIAN"] = "RU";
    LanguageCode["HINDI"] = "HI";
    LanguageCode["YORUBA"] = "YO";
    LanguageCode["IGBO"] = "IG";
    LanguageCode["HAUSA"] = "HA";
    LanguageCode["SWAHILI"] = "SW";
})(LanguageCode || (exports.LanguageCode = LanguageCode = {}));
<<<<<<< HEAD
var QuestionType;
(function (QuestionType) {
    QuestionType["SINGLE"] = "Single";
    QuestionType["Multiple"] = "Multiple";
    QuestionType["THEORY"] = "Theory";
})(QuestionType || (exports.QuestionType = QuestionType = {}));
=======
var QuizType;
(function (QuizType) {
    QuizType["MULTIPLE_CHOICE"] = "MULTIPLE_CHOICE";
    QuizType["FILL_IN_BLANK"] = "FILL_IN_BLANK";
})(QuizType || (exports.QuizType = QuizType = {}));
>>>>>>> 2f02c363aeb6a6515fd726c55e0d04a284f89bdb
