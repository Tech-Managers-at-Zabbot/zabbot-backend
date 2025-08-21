import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();



const generateToken = (data:Record<string,any>, expiresIn:any) => {
  return jwt.sign(
    { data },
    process.env.APP_JWT_SECRET!,
    { expiresIn }
  );
};

const validateToken = (token: string) => {
    try {
        const decoded = jwt.verify(token, process.env.APP_JWT_SECRET!);
        return decoded;
    }
    catch (error) {
        console.error('Token validation error:', error);
        return null;
    }
}

const parseStringified = (data: any) => {
  if (typeof data === 'string') {
    try {
      return JSON.parse(data);
    } catch (err) {
      console.error("Invalid JSON string:", err);
      throw new Error("Invalid stringified JSON input");
    }
  }
  return data;
}

export default {
    generateToken,
    validateToken,
    parseStringified
}