import { Response, NextFunction } from 'express';
import { JwtPayload } from 'jsonwebtoken';
export declare const generalAuthFunction: (request: JwtPayload, response: Response, next: NextFunction) => Promise<any>;
export declare function rolePermit(roles: string[]): (request: JwtPayload, response: Response, next: NextFunction) => Promise<any>;
