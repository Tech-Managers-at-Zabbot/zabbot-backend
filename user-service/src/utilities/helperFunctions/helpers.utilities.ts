import jwt from 'jsonwebtoken';
import bcrypt from "bcryptjs";
import { errorUtilities } from '../../../../shared/utilities';
import crypto from 'crypto';
import config from '../../../../config/config';

const hashPassword = async (password: string) => {
  const saltRounds = 10;
  const salt = await bcrypt.genSalt(saltRounds);
  const hash = await bcrypt.hash(password, salt);
  return hash;
};

const generateToken = (data: any) => {
  return jwt.sign(data.data, `${config.APP_JWT_SECRET}`, { expiresIn: `${data.expires}` });
};

const convertToDDMMYY = (isoDateString: any) => {
  const date = new Date(isoDateString);
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear().toString().slice(-2);
  return `${day}-${month}-${year}`;

}

const convertToISODateString = (regularDateString: any): string | null => {
  const dateParts = regularDateString.split('/');

  if (dateParts.length === 3) {
    const day = dateParts[0].padStart(2, '0');
    const month = dateParts[1].padStart(2, '0');
    const year = dateParts[2];

    const date = new Date(`${year}-${month}-${day}`);

    if (!isNaN(date.getTime())) {
      return date.toISOString().slice(0, 10);
    }
  }
  return null;
};

const validateToken = (token: string) => {
  if (!token) {
    throw errorUtilities.createError('Token is required', 400);
  }

  if (!config.APP_JWT_SECRET) {
    throw errorUtilities.createError('JWT secret is not configured', 400);
  }

  try {
    const decoded = jwt.verify(token, config.APP_JWT_SECRET);
    return decoded;
  } catch (error:any) {
    if (error instanceof jwt.TokenExpiredError) {
      throw errorUtilities.createError('Token has expired, please request for another verification link', 400);
    }

    if (error instanceof jwt.JsonWebTokenError) {
      console.error(`Invalid token: ${error.message}`)
      throw errorUtilities.createError(`Invalid token, Please request another verification link`, 400);
    }

    if (error instanceof jwt.NotBeforeError) {
      throw errorUtilities.createError('Token is not active yet. Please request for another verification link', 400);
    }
    throw errorUtilities.createError(`Token validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`, 400);
  }
};

const comparePasswords = async (password: string, hashedPassword: string) => {
  try {
    const isMatch = await bcrypt.compare(password, hashedPassword);
    return isMatch;
  } catch (error:any) {
    console.error(`Error validating password: ${error}`);
    throw errorUtilities.createError('Error validating password', 500);
  }
};

/**
 * Generates a cryptographically secure OTP of specified length
 * @param length - The length of the OTP (default: 6)
 * @returns A string containing random digits
 */
const generateOtp = (length: number = 4): string => {
  if (length < 1) {
    throw errorUtilities.createError('OTP length must be at least 1', 400);
  }
  
  if (length > 20) {
    throw errorUtilities.createError('OTP length should not exceed 20 for practical purposes', 400);
  }

  let otp = '';
  
  for (let i = 0; i < length; i++) {
    const digit = crypto.randomInt(0, 10);
    otp += digit.toString();
  }

  return otp;
}

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

const generateOtpWithOptions = (options: OtpOptions = {}): string => {
  const { 
    length = 4, 
    excludeZero = false, 
    prefix = '', 
    suffix = '' 
  } = options;

  if (length < 1) {
    throw new Error('OTP length must be at least 1');
  }

  let otp = '';
  
  for (let i = 0; i < length; i++) {
    let digit: number;
    
    if (excludeZero) {
      digit = crypto.randomInt(1, 10);
    } else {
      digit = crypto.randomInt(0, 10);
    }
    
    otp += digit.toString();
  }

  return `${prefix}${otp}${suffix}`;
}

export default {
  generateToken,
  validateToken,
  hashPassword,
  convertToDDMMYY,
  convertToISODateString,
  comparePasswords,
  generateOtp,
  generateOtpWithOptions
}