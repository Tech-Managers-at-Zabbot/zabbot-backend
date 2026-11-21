import { userServices } from "../../services";
import {
  errorUtilities,
  responseUtilities,
} from "../../../../shared/utilities";
import { Request, Response } from "express";
import { helpersUtilities } from "../../../../shared/utilities";
import { JwtPayload } from "jsonwebtoken";

// Only deliberately approved profile fields may leave this endpoint.
// In particular, never expose passwords, JWT/refresh tokens, OAuth tokens,
// security questions, or customer/payment identifiers via query projections.
const safeProfileFields = [
  "id", "firstName", "lastName", "email", "role",
  "isVerified", "isActive", "isBlocked", "profilePicture",
  "country", "timeZone", "currentStreak", "longestStreak",
  "lastStreakDate", "badges", "noOfSubscriptions",
];

const getSingleUser = errorUtilities.withControllerErrorHandling(
  async (request: Request, response: Response) => {
    const { userId } = request.params;
    const authenticated = (request as Request & {
      user?: { userId?: string; role?: string };
    }).user;

    if (!authenticated?.userId) {
      return response.status(401).json({
        status: "error",
        message: "Authentication required",
      });
    }

    if (authenticated.userId !== userId && authenticated.role !== "admin") {
      return response.status(403).json({
        status: "error",
        message: "Not authorized to access this profile",
      });
    }

    // Disallow arbitrary caller-controlled Sequelize attribute lists.
    const userDetails = await userServices.getSingleUserService(
      userId,
      safeProfileFields,
    );
    return responseUtilities.responseHandler(
      response,
      userDetails.message,
      userDetails.statusCode,
      userDetails.data,
    );
  },
);

const getAllUsersCount = errorUtilities.withControllerErrorHandling(
  async (request: Request, response: Response) => {
    const userCount = await userServices.getAllUserCountService();
    return responseUtilities.responseHandler(
      response,
      userCount.message,
      userCount.statusCode,
      userCount.data
    );
  }
);

const changeUserProfilePicture = errorUtilities.withControllerErrorHandling(
  async (request: JwtPayload, response: Response) => {
    const { userId } = request.user;
    const { mediaType } = request.body;
    const files = request.files;

    if (!files || files.length === 0 || !mediaType) {
      return responseUtilities.responseHandler(
        response,
        "No file uploaded",
        401
      );
    }

    const uploadStatus = await userServices.changeProfilePicture(
      userId,
      mediaType,
      files
    );

    return responseUtilities.responseHandler(
      response,
      uploadStatus.message,
      uploadStatus.statusCode,
      uploadStatus.data
    );
  }
);

export default {
  getSingleUser,
  getAllUsersCount,
  changeUserProfilePicture,
};
