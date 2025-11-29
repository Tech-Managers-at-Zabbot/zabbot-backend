import { helperFunctions } from "../../utilities/index";
import usersRepositories from "../../repositories/userRepositories/users.repositories";
import {
  responseUtilities,
  errorUtilities,
} from "../../../../shared/utilities";
import { uploadFile } from "../../../../shared/cloudinary/api";
import { StatusCodes } from "../../../../shared/statusCodes/statusCodes.responses";
import { GeneralResponses } from "../../responses/generalResponses/general.responses";
import {
  MediaType,
  BulkUploadResponse,
} from "../../../../shared/cloudinary/types";
import { CloudinaryService } from "../../../../shared/cloudinary/server";

const getSingleUserService = errorUtilities.withServiceErrorHandling(
  async (userId: string, projection?: string[]) => {
    const user = await usersRepositories.getOne({ id: userId }, projection);
    if (!user) {
      throw errorUtilities.createError(
        GeneralResponses.USER_NOT_FOUND,
        StatusCodes.NotFound
      );
    }
    return responseUtilities.handleServicesResponse(
      StatusCodes.OK,
      GeneralResponses.PROCESS_SUCCESSFUL,
      user
    );
  }
);

const getAllUserCountService = errorUtilities.withServiceErrorHandling(
  async () => {
    const userCount = await usersRepositories.getAllCount();
    return responseUtilities.handleServicesResponse(
      StatusCodes.OK,
      GeneralResponses.PROCESS_SUCCESSFUL,
      userCount
    );
  }
);

const updateSingleUserService = errorUtilities.withServiceErrorHandling(
  async (userId: string, updateData: Record<string, any>) => {
    const userUpdate = await usersRepositories.updateOne(
      {
        id: userId,
      },
      updateData
    );
    return responseUtilities.handleServicesResponse(
      StatusCodes.OK,
      GeneralResponses.PROCESS_SUCCESSFUL,
      userUpdate
    );
  }
);

//WRITE A MIGRATION TO STORE PROFILE IMAGE PUBLIC IDs IN DATABASE FOR EASY DELETION

const changeProfilePicture = errorUtilities.withServiceErrorHandling(
  async (userId: string, mediaType: string, files: Record<string, any>[]) => {
    const category = "profile-pictures";

    const uploadProfilePicture: any = await uploadFile(
      category,
      mediaType,
      files
    );
    if (uploadProfilePicture.status === "invalid") {
      throw errorUtilities.createError(
        uploadProfilePicture.message,
        StatusCodes.BadRequest
      );
    }else if (uploadProfilePicture.status === "error") {
      throw errorUtilities.createError(
        uploadProfilePicture.message,
        StatusCodes.InternalServerError
      );
    }

    const successfulUploads = uploadProfilePicture.data.successful;

    await usersRepositories.updateOne(
      { id: userId },
      {
        profilePicture: successfulUploads[0].secure_url,
        profilePicturePublicId: successfulUploads[0].public_id,
      }
    );

    return responseUtilities.handleServicesResponse(
      StatusCodes.OK,
      GeneralResponses.PROCESS_SUCCESSFUL,
      uploadProfilePicture.data.successful
    );
  }
);

export default {
  getSingleUserService,
  getAllUserCountService,
  updateSingleUserService,
  changeProfilePicture,
};
