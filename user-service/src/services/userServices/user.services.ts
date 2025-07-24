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
  async (userId:string, projection?:string[]) => {
  const user = await usersRepositories.getOne({ id:userId, projection });
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

export default {
    getSingleUserService
}