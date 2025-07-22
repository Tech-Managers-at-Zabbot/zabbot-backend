import brcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import config from '../../../config/config';
import dayjs from 'dayjs';

/**
 * Hash Password:
 * This function hashes a given password using bcrypt with a salt factor of 5.
 * @param {string} password - The password to be hashed.
 * @returns {Promise<string>} - The hashed password.
 * @throws {Error} - Throws an error if there is an issue with hashing the password.
 */

const hashPassword = async (password: string): Promise<string> => {
  const salt = await brcrypt.genSalt(5);
  const passwordHash = await brcrypt.hash(password, salt);
  return passwordHash;
};

/**
 * Validate Password:
 * This function compares a given password with a hashed user password using bcrypt.
 * @param {string} password - The password to be validated.
 * @param {string} userPassword - The hashed user password to compare against.
 * @returns {Promise<boolean>} - Returns true if the password matches, otherwise false.
 * @throws {Error} - Throws an error if there is an issue with validating the password.
 */

const bcryptValidate = async (
  password: string,
  userPassword: string,
): Promise<boolean> => {
  return await brcrypt.compare(password, userPassword);
};

/**
 * Generate Token:
 * This function generates a JSON Web Token (JWT) with a given payload and an expiration time of 15 hours.
 * @param {string | number | any} payload - The payload to be included in the token.
 * @returns {Promise<string>} - The generated token.
 * @throws {Error} - Throws an error if there is an issue with generating the token.
 */

const generateTokens = async (
  payload: object,
  expiresIn: string | number | any
): Promise<string> => {
  return jwt.sign(payload, config.EDEDUN_APP_SECRET, { expiresIn });
};


const dateFormatter = (dateString: Date) => {
  const year = dateString.getFullYear();
  const month = dateString.getMonth() + 1;
  const day = dateString.getDate();
  const hours = dateString.getHours();
  const minutes = dateString.getMinutes();
  const seconds = dateString.getSeconds();
  const date = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
  const time = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;

  return {
    date,
    time
  };
};

  // Function to calculate endTime
  const calculateEndTime = (startTime: string, duration: number, startDate:string) => {
    const start = dayjs(`${startDate}T${startTime}`);
    const end = start.add(duration, "minute");
    return end.format("HH:mm");
  };

  const comparePasswords = async (
    password: string,
    userPassword: string,
  ): Promise<boolean> => {
    return password === userPassword;
  };

export default {
  hashPassword,
  bcryptValidate,
  generateTokens,
  dateFormatter,
  calculateEndTime,
  comparePasswords
};
