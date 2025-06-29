import jwt from 'jsonwebtoken';
import config from '../../../config/config';



const generateToken = (data:Record<string,any>, expiresIn:any) => {
  return jwt.sign(
    { data },
    config.APP_JWT_SECRET!,
    { expiresIn }
  );
};

const validateToken = (token: string) => {
    try {
        const decoded = jwt.verify(token, config.APP_JWT_SECRET!);
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