import jwt from 'jsonwebtoken';
/**
 * Generates OTP with additional options
 * @param options - Configuration object
 */
interface OtpOptions {
    length?: number;
    excludeZero?: boolean;
    prefix?: string;
    suffix?: string;
}
declare const _default: {
    generateToken: (data: any) => string;
    validateToken: (token: string) => string | jwt.JwtPayload;
    hashPassword: (password: string) => Promise<string>;
    convertToDDMMYY: (isoDateString: any) => string;
    convertToISODateString: (regularDateString: any) => string | null;
    comparePasswords: (password: string, hashedPassword: string) => Promise<boolean>;
    generateOtp: (length?: number) => string;
    generateOtpWithOptions: (options?: OtpOptions) => string;
};
export default _default;
