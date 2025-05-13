"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.executeFoundingListNotification = void 0;
const express_1 = __importDefault(require("express"));
const services_1 = require("../services");
const app = (0, express_1.default)();
const executeFoundingListNotification = async (request, response) => {
    const { email, firstName, lastName } = request.body;
    const newEmail = await services_1.mailChimpServices.handleMailingListSubscriptionService(email, firstName, lastName);
    console.log('New email:', newEmail);
};
exports.executeFoundingListNotification = executeFoundingListNotification;
