import { OptionAttributes } from "../../data-types/interface"
import { errorUtilities, responseUtilities } from "../../../../shared/utilities";
import optionRepositories from "../../repositories/option.repository"
import { StatusCodes } from "../../../../shared/statusCodes/statusCodes.responses";
import { v4 } from "uuid";


const getOptions = errorUtilities.withServiceErrorHandling(
  async (params?: {questionId: string}) => {
    const options = await optionRepositories.getOptions(params);
    return responseUtilities.handleServicesResponse(StatusCodes.OK, "success", options);
  }
);

const getOption = errorUtilities.withServiceErrorHandling(
  async (id: string) => {
    const option = await optionRepositories.getOption(id);
    if (!option) {
      throw errorUtilities.createError(`Question not found`, 404);
    }

    return responseUtilities.handleServicesResponse(StatusCodes.OK, "success", option);
  }
);

const addOption = errorUtilities.withServiceErrorHandling(
  async (optionData: any) => {
    const payload = {
      ...optionData, 
      id: v4()
    };

    const newOption = await optionRepositories.addOption(payload);
    return responseUtilities.handleServicesResponse(StatusCodes.Created, "Option created successfully", newOption);
  }
);

const updateOption = errorUtilities.withServiceErrorHandling(
  async (id: string, optionData: OptionAttributes) => {
    const option = await optionRepositories.getOption(id);
    if (!option) {
      throw errorUtilities.createError(`Option not found`, 404);
    }

    option.name = optionData.name;
    option.isCorrect = optionData.isCorrect;

    const updatedOption = await optionRepositories.updateOption(id, option);
    return responseUtilities.handleServicesResponse(StatusCodes.OK, "Option updated successfully", updatedOption);
  }
);

const deleteOption = errorUtilities.withServiceErrorHandling(
  async (id: string) => {
    const option = await optionRepositories.getOption(id);
    if (!option)
      throw errorUtilities.createError(`Option not found`, 404);

    await optionRepositories.deleteOption(id);
    return responseUtilities.handleServicesResponse(StatusCodes.NoContent, "Option deleted successfully", null);
  }
);

export default {
  getOptions,
  getOption,
  addOption,
  updateOption,
  deleteOption
}