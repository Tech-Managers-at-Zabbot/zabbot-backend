"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuizType = exports.LanguageCode = exports.Level = exports.ContentSourceType = exports.ContentDataType = void 0;
var ContentDataType;
(function (ContentDataType) {
    // TEXT = 'text',
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
var QuizType;
(function (QuizType) {
    QuizType["MULTIPLE_CHOICE"] = "MULTIPLE_CHOICE";
    QuizType["FILL_IN_BLANK"] = "FILL_IN_BLANK";
})(QuizType || (exports.QuizType = QuizType = {}));
