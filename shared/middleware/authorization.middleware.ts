import { Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import Users from "../entities/user-service-entities/users/users.entities";
import config from "../../config/config";

export const generalAuthFunction = async (
  request: JwtPayload,
  response: Response,
  next: NextFunction,
): Promise<any> => {
  try {
    const authorizationHeader = request.headers.authorization;

    if (!authorizationHeader) {
      return response.status(403).json({
        status: "Failed",
        message: "Please login again",
      });
    }

    const authorizationToken = authorizationHeader.split(" ")[1];

    if (!authorizationToken) {
      return response.status(403).json({
        status: "Failed",
        message: "Login required",
      });
    }

    let verifiedUser: any;

    try {
      verifiedUser = jwt.verify(authorizationToken, `${config.APP_JWT_SECRET}`);
      const decodedToken: any = verifiedUser;
      const projection = [
        "refreshToken",
        "isVerified",
        "isActive",
        "isBlocked",
        "role",
        "accessToken",
        "id",
      ];

      const userDetails = await Users.findOne({
        where: { id: decodedToken?.userId },
        attributes: projection,
        raw: true,
      });

      if (!userDetails) {
        return response.status(403).json({
          status: "error",
          message: "User not found, please login again or contact admin",
        });
      }

      if (!userDetails.isActive || userDetails.isBlocked || !userDetails.isVerified) {
        return response.status(403).json({
          status: "error",
          message: "Account blocked, please contact admin",
        });
      }

      if (!userDetails.refreshToken) {
        return response.status(403).json({
          status: "error",
          message: "Please login again.",
        });
      }
      verifiedUser = { ...verifiedUser, role: userDetails.role };
    } catch (error: any) {
      return response.status(401).json({
        status: "error",
        message: error?.name === "TokenExpiredError" ? "Access token expired" : "Invalid access token",
      });
    }

    request.user = verifiedUser;

    return next();
  } catch (error: any) {
    return response.status(500).json({
      status: "error",
      message: `Internal Server Error: ${error.message}`,
    });
  }
};

export function rolePermit(roles: string[]) {
  return async (
    request: JwtPayload,
    response: Response,
    next: NextFunction,
  ): Promise<any> => {
    const userRole = request.user.role;
    const { userId } = request.user;
    if (!userRole || !userId) {
      return response.status(403).json({
        status: "error",
        message: "User Not Authorized. Please login again",
      });
    }

    const isAuthorized = roles.includes(userRole);

    if (!isAuthorized) {
      return response.status(401).json({
        status: "error",
        message: "Not Permitted For Action",
      });
    }

    next();
  };
}
