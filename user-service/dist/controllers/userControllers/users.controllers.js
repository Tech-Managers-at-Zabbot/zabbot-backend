"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const services_1 = require("../../services");
const utilities_1 = require("../../../../shared/utilities");
const utilities_2 = require("../../../../shared/utilities");
const getSingleUser = utilities_1.errorUtilities.withControllerErrorHandling(async (request, response) => {
    let { projection } = request.query;
    const { userId } = request.params;
    if (projection) {
        projection = utilities_2.helpersUtilities.parseStringified(projection);
    }
    const userDetails = await services_1.userServices.getSingleUserService(userId, projection);
    return utilities_1.responseUtilities.responseHandler(response, userDetails.message, userDetails.statusCode, userDetails.data);
});
const getAllUsersCount = utilities_1.errorUtilities.withControllerErrorHandling(async (request, response) => {
    const userCount = await services_1.userServices.getAllUserCountService();
    return utilities_1.responseUtilities.responseHandler(response, userCount.message, userCount.statusCode, userCount.data);
});
exports.default = {
    getSingleUser,
    getAllUsersCount
};
