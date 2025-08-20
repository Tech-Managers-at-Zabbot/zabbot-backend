"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OtpResponses = void 0;
var OtpResponses;
(function (OtpResponses) {
    OtpResponses["INVALID_OTP"] = "Otp not valid, please request for a new one";
    OtpResponses["ENTER_OTP"] = "Please enter the otp sent to your email";
    OtpResponses["OTP_EXCEEDED_ATTEMPTS"] = "You have exceeded the maximum number of attempts, please request for a new OTP";
    OtpResponses["OTP_EXPIRED"] = "Otp expired, please request for a new one";
    OtpResponses["OTP_SENT_SUCCESSFULLY"] = "Otp sent successfully, please check your email";
    OtpResponses["OTP_VERIFIED_SUCCESSFULLY"] = "Otp verified successfully";
    OtpResponses["OTP_CREATION_FAILED"] = "Otp creation failed, please try again";
    OtpResponses["OTP_RESEND_FAILED"] = "Otp resend failed, please try again";
})(OtpResponses || (exports.OtpResponses = OtpResponses = {}));
