"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addFieldToListController = exports.sendgridUnsubscribeFoundingListNotification = exports.sendgridExecuteFoundingListNotification = exports.mailChimpExecuteFoundingListNotification = void 0;
const express_1 = __importDefault(require("express"));
const services_1 = require("../services");
const utilities_1 = require("../../../shared/utilities");
const app = (0, express_1.default)();
exports.mailChimpExecuteFoundingListNotification = utilities_1.errorUtilities.withControllerErrorHandling(async (request, response) => {
    const { email, firstName, lastName } = request.body;
    const newEmail = await services_1.mailChimpServices.handleMailingListSubscriptionService(email, firstName, lastName);
    // console.log('New email:', newEmail);
});
exports.sendgridExecuteFoundingListNotification = utilities_1.errorUtilities.withControllerErrorHandling(async (request, response) => {
    const { email, firstName, lastName } = request.body;
    const newEmail = await services_1.sendgridMailServices.sendWelcomeFoundingListEmailService(email, firstName, lastName);
    // console.log('New email:', newEmail);
});
exports.sendgridUnsubscribeFoundingListNotification = utilities_1.errorUtilities.withControllerErrorHandling(async (request, response) => {
    const { email } = request.body;
    const unsubscribe = await services_1.sendgridMailServices.removeFromSengridFoundersListService(email);
    return utilities_1.responseUtilities.responseHandler(response, unsubscribe.message, unsubscribe.statusCode, unsubscribe.data);
});
exports.addFieldToListController = utilities_1.errorUtilities.withControllerErrorHandling(async (request, response) => {
    const addField = await services_1.sendgridMailServices.addCustomFieldToSendgridList(request.body);
    return utilities_1.responseUtilities.responseHandler(response, addField.message, addField.statusCode, addField.data);
});
const addUsersToUpdateListController = utilities_1.errorUtilities.withControllerErrorHandling(async (request, response) => {
    const addUserToUpdate = await services_1.sendgridMailServices.addToSendGridUpdatesListService(request.body);
    return utilities_1.responseUtilities.responseHandler(response, addUserToUpdate.message, addUserToUpdate.statusCode, addUserToUpdate.data);
});
const addUsersToContributorsController = utilities_1.errorUtilities.withControllerErrorHandling(async (request, response) => {
    const addUserToContribuotrs = await services_1.sendgridMailServices.addToSendGridContributorsListService(request.body);
    return utilities_1.responseUtilities.responseHandler(response, addUserToContribuotrs.message, addUserToContribuotrs.statusCode, addUserToContribuotrs.data);
});
const addUsersToTestersController = utilities_1.errorUtilities.withControllerErrorHandling(async (request, response) => {
    const addUserToTesters = await services_1.sendgridMailServices.addToSendGridBetaTestersListService(request.body);
    return utilities_1.responseUtilities.responseHandler(response, addUserToTesters.message, addUserToTesters.statusCode, addUserToTesters.data);
});
exports.default = {
    mailChimpExecuteFoundingListNotification: exports.mailChimpExecuteFoundingListNotification,
    sendgridExecuteFoundingListNotification: exports.sendgridExecuteFoundingListNotification,
    sendgridUnsubscribeFoundingListNotification: exports.sendgridUnsubscribeFoundingListNotification,
    addFieldToListController: exports.addFieldToListController,
    addUsersToUpdateListController,
    addUsersToContributorsController,
    addUsersToTestersController
};
