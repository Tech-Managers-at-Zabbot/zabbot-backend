"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SecurityLevel = exports.LogLevel = exports.ActivityType = exports.OtpNotificationType = exports.RegisterMethods = exports.ProfileVisibility = exports.UserRoles = void 0;
var UserRoles;
(function (UserRoles) {
    UserRoles["ADMIN"] = "admin";
    UserRoles["USER"] = "user";
})(UserRoles || (exports.UserRoles = UserRoles = {}));
var ProfileVisibility;
(function (ProfileVisibility) {
    ProfileVisibility["PUBLIC"] = "public";
    ProfileVisibility["PRIVATE"] = "private";
})(ProfileVisibility || (exports.ProfileVisibility = ProfileVisibility = {}));
var RegisterMethods;
(function (RegisterMethods) {
    RegisterMethods["GOOGLE"] = "google";
    RegisterMethods["EMAIL"] = "email";
})(RegisterMethods || (exports.RegisterMethods = RegisterMethods = {}));
var OtpNotificationType;
(function (OtpNotificationType) {
    OtpNotificationType["EMAIL"] = "email";
    OtpNotificationType["SMS"] = "sms";
    OtpNotificationType["TWO_FACTOR"] = "two-factor";
})(OtpNotificationType || (exports.OtpNotificationType = OtpNotificationType = {}));
var ActivityType;
(function (ActivityType) {
    ActivityType["LOGIN"] = "LOGIN";
    ActivityType["LOGOUT"] = "LOGOUT";
    ActivityType["PROFILE_UPDATE"] = "PROFILE_UPDATE";
    ActivityType["PASSWORD_CHANGE"] = "PASSWORD_CHANGE";
    ActivityType["FILE_UPLOAD"] = "FILE_UPLOAD";
    ActivityType["FILE_DOWNLOAD"] = "FILE_DOWNLOAD";
    ActivityType["PURCHASE"] = "PURCHASE";
    ActivityType["API_ACCESS"] = "API_ACCESS";
    ActivityType["SECURITY_EVENT"] = "SECURITY_EVENT";
})(ActivityType || (exports.ActivityType = ActivityType = {}));
var LogLevel;
(function (LogLevel) {
    LogLevel["INFO"] = "INFO";
    LogLevel["WARNING"] = "WARNING";
    LogLevel["ERROR"] = "ERROR";
    LogLevel["CRITICAL"] = "CRITICAL";
})(LogLevel || (exports.LogLevel = LogLevel = {}));
var SecurityLevel;
(function (SecurityLevel) {
    SecurityLevel["LOW"] = "LOW";
    SecurityLevel["MEDIUM"] = "MEDIUM";
    SecurityLevel["HIGH"] = "HIGH";
    SecurityLevel["CRITICAL"] = "CRITICAL";
})(SecurityLevel || (exports.SecurityLevel = SecurityLevel = {}));
