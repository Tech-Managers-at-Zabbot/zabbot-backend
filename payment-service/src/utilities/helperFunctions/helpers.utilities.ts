import jwt from 'jsonwebtoken';
import bcrypt from "bcryptjs";
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


export default {
  generateToken,
  hashPassword,
}