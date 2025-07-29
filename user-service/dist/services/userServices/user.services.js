"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const users_repositories_1 = __importDefault(require("../../repositories/userRepositories/users.repositories"));
const utilities_1 = require("../../../../shared/utilities");
const statusCodes_responses_1 = require("../../../../shared/statusCodes/statusCodes.responses");
const general_responses_1 = require("../../responses/generalResponses/general.responses");
const getSingleUserService = utilities_1.errorUtilities.withServiceErrorHandling(async (userId, projection) => {
    const user = await users_repositories_1.default.getOne({ id: userId }, projection);
    if (!user) {
        throw utilities_1.errorUtilities.createError(general_responses_1.GeneralResponses.USER_NOT_FOUND, statusCodes_responses_1.StatusCodes.NotFound);
    }
    return utilities_1.responseUtilities.handleServicesResponse(statusCodes_responses_1.StatusCodes.OK, general_responses_1.GeneralResponses.PROCESS_SUCCESSFUL, user);
});
const getAllUserCountService = utilities_1.errorUtilities.withServiceErrorHandling(async () => {
    const userCount = await users_repositories_1.default.getAllCount();
    return utilities_1.responseUtilities.handleServicesResponse(statusCodes_responses_1.StatusCodes.OK, general_responses_1.GeneralResponses.PROCESS_SUCCESSFUL, userCount);
});
exports.default = {
    getSingleUserService,
    getAllUserCountService
};
