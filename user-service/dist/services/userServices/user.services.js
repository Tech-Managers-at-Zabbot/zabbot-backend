"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const users_repositories_1 = __importDefault(require("../../repositories/userRepositories/users.repositories"));
const utilities_1 = require("../../../../shared/utilities");
const api_1 = require("../../../../shared/cloudinary/api");
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
const updateSingleUserService = utilities_1.errorUtilities.withServiceErrorHandling(async (userId, updateData) => {
    const userUpdate = await users_repositories_1.default.updateOne({
        id: userId,
    }, updateData);
    return utilities_1.responseUtilities.handleServicesResponse(statusCodes_responses_1.StatusCodes.OK, general_responses_1.GeneralResponses.PROCESS_SUCCESSFUL, userUpdate);
});
//WRITE A MIGRATION TO STORE PROFILE IMAGE PUBLIC IDs IN DATABASE FOR EASY DELETION
const changeProfilePicture = utilities_1.errorUtilities.withServiceErrorHandling(async (userId, mediaType, files) => {
    const category = "profile-pictures";
    console.log('Test1', userId, category, mediaType, files);
    const uploadProfilePicture = await (0, api_1.uploadFile)(category, mediaType, files);
    console.log('Test2', uploadProfilePicture);
    if (uploadProfilePicture.status === "invalid") {
        throw utilities_1.errorUtilities.createError(uploadProfilePicture.message, statusCodes_responses_1.StatusCodes.BadRequest);
    }
    else if (uploadProfilePicture.status === "error") {
        throw utilities_1.errorUtilities.createError(uploadProfilePicture.message, statusCodes_responses_1.StatusCodes.InternalServerError);
    }
    const successfulUploads = uploadProfilePicture.data.successful;
    await users_repositories_1.default.updateOne({ id: userId }, {
        profilePicture: successfulUploads[0].secure_url,
        profilePicturePublicId: successfulUploads[0].public_id,
    });
    return utilities_1.responseUtilities.handleServicesResponse(statusCodes_responses_1.StatusCodes.OK, general_responses_1.GeneralResponses.PROCESS_SUCCESSFUL, uploadProfilePicture.data.successful);
});
exports.default = {
    getSingleUserService,
    getAllUserCountService,
    updateSingleUserService,
    changeProfilePicture,
};
