

export enum GeneralResponses {
    EMAIL_EXISTS_LOGIN = "This email already exists, please proceed to login",
    PROCESS_UNSSUCCESSFUL = "Process unsuccessful, please try again",
    USER_REGSTRATION_SUCCESSFUL = "User registered successfully, a mail has been sent to your email, click on the link in it to verify your account",
    ADMIN_REGISTRATION_SUCCESSFUL = "Admin account successfully registered. Please check your mail for an email. Welcome to Zabbot.",
    VERIFICATION_ERROR = 'Sorry, verification error. Please request for another verification link',
    USER_NOT_FOUND = "User not found",
    ALREADY_VERIFIED_ACCOUNT = 'Account is already verified',
    SUCCESSFUL_VERIFICATION = "Account verified successfully, please proceed to login",
    INACTIVE_ACCOUNT = "Account is inactive, please contact support",
    BLOCKED_ACCOUNT = "Account is blocked, please contact support",
    INVALID_CREDENTIALS = "Invalid credentials, please try again",
    UNVERIFIED_ACCOUNT = "Your account is not verified, please verify your account",
    SUCCESSFUL_LOGIN = "Login successful",
    EMAIL_REQUIRED = "Email is required",
    SUCCESSFUL_PASSWORD_RESET_LINK_SENT= "Password reset link sent successfully",
    MISMATCHED_PASSEORD = "Passwords do not match",
    INVALID_TOKEN = "Invalid operation, please try again",
    FAILED_PASSWORD_RESET = "Password reset failed, please try again",
    SUCCESSFUL_PASSWORD_RESET = "Password reset successful",
    UNAUTHORIZED_FOR_TESTING = "User is not authorized for beta testing",
    FAILED_TESTER_CHECK = "Beta tester check failed",
    SIGNUP_AS_TESTER = "User not found. Please sign up as a beta tester at https://zabbot.com-founders-circle",

}