"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const services_1 = require("../../services");
const utilities_1 = require("../../utilities");
const userRegister = async (request, response) => {
    const newUser = await services_1.authServices.userRegister(request.body);
    return utilities_1.responseUtilities.responseHandler(response, newUser.message, newUser.statusCode, newUser.data);
};
const userLoginWithEmail = async (request, response) => {
    const loggedInUser = await services_1.authServices.userLogin(request.body);
    if (loggedInUser.statusCode === 200) {
        response
            .header("x-access-token", loggedInUser.data.accessToken)
            .header("x-refresh-token", loggedInUser.data.refreshToken);
    }
    return utilities_1.responseUtilities.responseHandler(response, loggedInUser.message, loggedInUser.statusCode, loggedInUser.data);
};
exports.default = {
    userRegister,
    userLoginWithEmail,
};
