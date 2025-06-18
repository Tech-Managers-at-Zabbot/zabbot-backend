

export enum OtpResponses {
    INVALID_OTP = "Otp not valid, please request for a new one",
    ENTER_OTP = "Please enter the otp sent to your email",
    OTP_EXCEEDED_ATTEMPTS = "You have exceeded the maximum number of attempts, please request for a new OTP",
    OTP_EXPIRED = "Otp expired, please request for a new one",
    OTP_SENT_SUCCESSFULLY = "Otp sent successfully, please check your email",
    OTP_VERIFIED_SUCCESSFULLY = "Otp verified successfully",
    OTP_CREATION_FAILED = "Otp creation failed, please try again",
    OTP_RESEND_FAILED = "Otp resend failed, please try again",
}