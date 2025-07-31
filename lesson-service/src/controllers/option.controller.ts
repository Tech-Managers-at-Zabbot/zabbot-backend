import {Request, Response} from 'express';
import { errorUtilities, responseUtilities } from '../../../shared/utilities';
import questionService from '../services/lessonServices/question.service';
import optionService from '../services/lessonServices/option.service';


// Controller to get all options
export const getOptionsController = errorUtilities.withControllerErrorHandling(
  async (req: Request, res: Response) => {
    const questionId = req.query;
    const options = await optionService.getOptions({questionId});

    return responseUtilities.responseHandler(res, options.message, options.statusCode, options.data);
  }
);

// Controller to get a single option
export const getOptionController = errorUtilities.withControllerErrorHandling(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const option = await optionService.getOption(id);

    return responseUtilities.responseHandler(res, option.message, option.statusCode, option.data);
  }
);

// Controller to add a new option
export const createOptionController = errorUtilities.withControllerErrorHandling(
  async (req: Request, res: Response) => {
    const payload = req.body;
    const option = await optionService.addOption(payload);

    return responseUtilities.responseHandler(res, option.message, option.statusCode, option.data);
  }
);

// Controller to update an existing option
export const updateOptionController = errorUtilities.withControllerErrorHandling(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const payload = req.body;
    const option = await optionService.updateOption(id, payload);

    return responseUtilities.responseHandler(res, option.message, option.statusCode, option.data);
  }
);

// Controller to delete a option
export const deleteOptionController = errorUtilities.withControllerErrorHandling(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const deletedOption = await optionService.deleteOption(id);

    return responseUtilities.responseHandler(res, deletedOption.message, deletedOption.statusCode, deletedOption.data);
  }
);