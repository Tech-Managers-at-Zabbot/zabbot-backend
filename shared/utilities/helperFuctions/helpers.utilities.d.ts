import jwt from 'jsonwebtoken';
declare const _default: {
    generateToken: (data: Record<string, any>, expiresIn: any) => string;
    validateToken: (token: string) => string | jwt.JwtPayload | null;
    parseStringified: (data: any) => any;
};
export default _default;
