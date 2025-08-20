"use strict";
//================= USER ================/
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgeGroup = exports.Gender = exports.Roles = exports.PhraseCategory = void 0;
var PhraseCategory;
(function (PhraseCategory) {
    PhraseCategory["Body_Part"] = "Body Part";
    PhraseCategory["Word"] = "Word";
    PhraseCategory["Counting_Number"] = "Counting Number";
    PhraseCategory["Days_Of_The_Week"] = "Days of the Week";
    PhraseCategory["Relationship"] = "Relationship";
    PhraseCategory["Phrase"] = "Phrase";
    PhraseCategory["Sentence"] = "Sentence";
    PhraseCategory["Color"] = "Color";
    PhraseCategory["Question"] = "Question";
    PhraseCategory["Other"] = "Other";
})(PhraseCategory || (exports.PhraseCategory = PhraseCategory = {}));
var Roles;
(function (Roles) {
    Roles["User"] = "User";
    Roles["Admin"] = "Admin";
    Roles["SuperAdmin"] = "SuperAdmin";
})(Roles || (exports.Roles = Roles = {}));
var Gender;
(function (Gender) {
    Gender["Male"] = "male";
    Gender["Female"] = "female";
})(Gender || (exports.Gender = Gender = {}));
var AgeGroup;
(function (AgeGroup) {
    AgeGroup["Child"] = "child";
    AgeGroup["Teenager"] = "teenager";
    AgeGroup["Adult"] = "adult";
})(AgeGroup || (exports.AgeGroup = AgeGroup = {}));
