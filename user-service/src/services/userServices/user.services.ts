import { helperFunctions } from "../../utilities/index";
import usersRepositories from "../../repositories/userRepositories/users.repositories";
import {
  responseUtilities,
  errorUtilities,
} from "../../../../shared/utilities";
import {
  StatusCodes,
} from "../../../../shared/statusCodes/statusCodes.responses";
import { GeneralResponses } from "../../responses/generalResponses/general.responses";



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
  })

const getAllUserCountService = errorUtilities.withServiceErrorHandling(
  async () => {
    const userCount = await usersRepositories.getAllCount()
    return responseUtilities.handleServicesResponse(
      StatusCodes.OK,
      GeneralResponses.PROCESS_SUCCESSFUL,
      userCount
    );
  })

const updateSingleUserService = errorUtilities.withServiceErrorHandling(
  async (userId:string, updateData:Record<string, any>) => {
    const userUpdate = await usersRepositories.updateOne(
      {
        id:userId
      },
      updateData
    )
    return responseUtilities.handleServicesResponse(
      StatusCodes.OK,
      GeneralResponses.PROCESS_SUCCESSFUL,
      userUpdate
    );
  })

export default {
  getSingleUserService,
  getAllUserCountService,
  updateSingleUserService
}