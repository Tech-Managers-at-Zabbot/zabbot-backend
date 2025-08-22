import { Response, NextFunction, raw } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { helpersUtilities } from '../utilities';
import Users from '../entities/user-service-entities/users/users.entities';
import dotenv from 'dotenv';

dotenv.config();

export const generalAuthFunction = async (
  request: JwtPayload,
  response: Response,
  next: NextFunction,
): Promise<any> => {
  try {

    const authorizationHeader = request.headers.authorization;

    if (!authorizationHeader) {
      return response.status(403).json({
        status: 'Failed',
        message: 'Please login again',
      });
    }

    const authorizationToken = authorizationHeader.split(' ')[1];

    if (!authorizationToken) {
      return response.status(403).json({
        status: 'Failed',
        message: 'Login required',
      });
    }

    let verifiedUser: any;

    try {
      verifiedUser = jwt.verify(authorizationToken, `${process.env.APP_JWT_SECRET}`);
      const decodedToken: any = jwt.decode(authorizationToken);
      const projection = ['refreshToken', 'isVerified', "isActive", "isBlocked", "role", "accessToken", "id"];

        const userDetails = await Users.findOne({ where: {id:decodedToken?.userId}, attributes: projection, raw: true });

        if(!userDetails) {
          return response.status(403).json({
            status: 'error',
            message: 'User not found, please login again or contact admin',
          });
        }

        if (userDetails?.isBlocked) {
          return response.status(403).json({
            status: 'error',
            message: 'Account blocked, please contact admin',
          });
        }

        if(!userDetails.refreshToken){
        return response.status(403).json({
            status: 'error',
            message: 'Please login again.',
          });
      }
    } catch (error: any) {

      if (error.message === 'jwt expired') {

        const decodedToken: any = jwt.decode(authorizationToken);

        if (!decodedToken?.userId) {
          return response.status(403).json({
            status: 'error',
            message: 'Invalid token',
          });
        }

        const projection = ['refreshToken', 'isVerified', "isActive", "isBlocked", "role", "accessToken", "id"];

        const userDetails = await Users.findOne({ where: {id:decodedToken?.userId}, attributes: projection, raw: true });

        if(!userDetails) {
          return response.status(403).json({
            status: 'error',
            message: 'User not found, please login again or contact admin',
          });
        }
        const refreshToken:any = userDetails?.refreshToken;

        let refreshVerifiedUser: any;
        try {
          refreshVerifiedUser = jwt.verify(refreshToken, `${process.env.APP_JWT_SECRET}`);
        } catch (refreshError: any) {
          return response.status(403).json({
            status: 'error',
            message: 'Refresh Token Expired. Please login again.',
          });
        }

        if (!userDetails) {
          return response.status(403).json({
            status: 'error',
            message: 'User not found, please login again or contact admin',
          });
        }

        if (userDetails?.isBlocked) {
          return response.status(403).json({
            status: 'error',
            message: 'Account blocked, please contact admin',
          });
        }

        const compareRefreshTokens = refreshToken === userDetails?.refreshToken

        if (compareRefreshTokens === false) {
          return response.status(403).json({
            status: 'error',
            message: 'Please login again.',
          });
        }

        const tokenPayload = {
          id: refreshVerifiedUser.id,
          email: refreshVerifiedUser.email,
          role: refreshVerifiedUser.role
        };

        const newAccessToken = helpersUtilities.generateToken(tokenPayload, '2h')

        const newRefreshToken = helpersUtilities.generateToken(tokenPayload, '30d')

        response.setHeader('x-access-token', newAccessToken);

        await Users.update({
          refreshToken: newRefreshToken
        }, {
          where: { id: refreshVerifiedUser.id }
        }
        )

        request.user = refreshVerifiedUser;

        return next();
      }

      return response.status(403).json({
        status: 'error',
        message: `Login Again, Invalid Token: ${error.message}`,
      });
    }

    request.user = verifiedUser;

    return next();

  } catch (error: any) {
    return response.status(500).json({
      status: 'error',
      message: `Internal Server Error: ${error.message}`,
    });
  }
};


export function rolePermit(roles: string[]) {
  return async (request: JwtPayload, response: Response, next: NextFunction): Promise<any> => {

    const userRole = request.user.role
    const { userId } = request.user
    if (!userRole || !userId) {
      return response.status(403).json({
        status: 'error',
        message: 'User Not Authorized. Please login again',
      });
    }

    const isAuthorized = roles.includes(userRole);

    if (!isAuthorized) {
      return response.status(401).json({
        status: 'error',
        message: 'Not Permitted For Action',
      });
    }

    next();
  };
}

