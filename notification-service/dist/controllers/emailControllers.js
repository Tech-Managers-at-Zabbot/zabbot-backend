"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendgridUnsubscribeFoundingListNotification = exports.sendgridExecuteFoundingListNotification = exports.mailChimpExecuteFoundingListNotification = void 0;
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
    const { token } = request.query;
    console.log('Token:', token);
    if (!token) {
        throw utilities_1.errorUtilities.createError('Token is required', 400);
    }
    const decodedDetails = utilities_1.helpersUtilities.validateToken(token);
    console.log('Decoded details:', decodedDetails);
    if (!decodedDetails) {
        throw utilities_1.errorUtilities.createError('Invalid token', 400);
    }
    const { email } = decodedDetails;
    const unsubscribe = await services_1.sendgridMailServices.removeFromFoundersListService(email);
    return utilities_1.responseUtilities.responseHandler(response, unsubscribe.message, unsubscribe.statusCode, unsubscribe.data);
});
exports.default = {
    mailChimpExecuteFoundingListNotification: exports.mailChimpExecuteFoundingListNotification,
    sendgridExecuteFoundingListNotification: exports.sendgridExecuteFoundingListNotification,
    sendgridUnsubscribeFoundingListNotification: exports.sendgridUnsubscribeFoundingListNotification
};
