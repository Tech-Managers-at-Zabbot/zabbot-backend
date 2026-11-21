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

      if (!userDetails.isActive || userDetails.isBlocked) {
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
      if (error.message === "jwt expired") {
        const decodedToken: any = jwt.decode(authorizationToken);

        if (!decodedToken?.userId) {
          return response.status(403).json({
            status: "error",
            message: "Invalid token",
          });
        }

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
        const refreshToken: any = userDetails?.refreshToken;

        let refreshVerifiedUser: any;
        try {
          refreshVerifiedUser = jwt.verify(
            refreshToken,
            `${config.APP_JWT_SECRET}`,
          );
        } catch (refreshError: any) {
          return response.status(403).json({
            status: "error",
            message: "Refresh Token Expired. Please login again.",
          });
        }

        if (!userDetails) {
          return response.status(403).json({
            status: "error",
            message: "User not found, please login again or contact admin",
          });
        }

        if (userDetails?.isBlocked) {
          return response.status(403).json({
            status: "error",
            message: "Account blocked, please contact admin",
          });
        }

        // A valid refresh JWT must identify the account of the expired access JWT.
        if (refreshVerifiedUser.userId !== decodedToken.userId) {
          return response.status(403).json({
            status: "error",
            message: "Invalid refresh token",
          });
        }

        if (!userDetails.isActive || !userDetails.isVerified) {
          return response.status(403).json({
            status: "error",
            message: "Account is not active or verified",
          });
        }

        if (!refreshToken) {
          return response.status(403).json({
            status: "error",
            message: "Please login again.",
          });
        }

        const tokenPayload = {
          userId: userDetails.id,
          email: refreshVerifiedUser.email,
          role: userDetails.role,
        };

        // Match the existing login service token format (flat JWT claims).
        const newAccessToken = jwt.sign(tokenPayload, String(config.APP_JWT_SECRET), {
          expiresIn: "2h",
        });
        const newRefreshToken = jwt.sign(tokenPayload, String(config.APP_JWT_SECRET), {
          expiresIn: "30d",
        });

        // Rotate only this account's stored refresh token.
        const [updatedCount] = await Users.update(
          { refreshToken: newRefreshToken },
          { where: { id: userDetails.id, refreshToken } },
        );
        if (updatedCount !== 1) {
          return response.status(403).json({
            status: "error",
            message: "Session changed. Please login again.",
          });
        }
        response.setHeader("x-access-token", newAccessToken);
        request.user = tokenPayload;

        return next();
      }

      return response.status(403).json({
        status: "error",
        message: `Login Again, Invalid Token: ${error.message}`,
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
