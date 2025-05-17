import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });


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

export default {
    generateToken,
    validateToken
}