import { userServices } from "../../services";
import {
  errorUtilities,
  responseUtilities,
} from "../../../../shared/utilities";
import { Request, Response } from "express";
import { helpersUtilities } from "../../../../shared/utilities";
import { JwtPayload } from "jsonwebtoken";

const getSingleUser = errorUtilities.withControllerErrorHandling(
  async (request: Request, response: Response) => {
    let { projection } = request.query;
    const { userId } = request.params;

    if (projection) {
      projection = helpersUtilities.parseStringified(projection);
    }
    const userDetails = await userServices.getSingleUserService(
      userId,
      projection
    );
    return responseUtilities.responseHandler(
      response,
      userDetails.message,
      userDetails.statusCode,
      userDetails.data
    );
  }
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
