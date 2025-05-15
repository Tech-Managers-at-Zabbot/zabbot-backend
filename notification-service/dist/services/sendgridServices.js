"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const utilities_1 = require("../../../shared/utilities");
const sendgridConfig_1 = __importDefault(require("../config/sendgridConfig"));
const sendWelcomeFoundingListEmailService = utilities_1.errorUtilities.withServiceErrorHandling(async (email, firstName, lastName) => {
    const fromEmail = process.env.SENDGRID_FROM_EMAIL;
    const fromName = process.env.SENDGRID_FROM_NAME;
    const templateId = process.env.SENDGRID_FOUNDING_LIST_WELCOME_TEMPLATE_ID;
    const messageDetails = {
        to: email,
        from: {
            email: fromEmail,
            name: fromName,
        },
        templateId,
        subject: `Ẹ káàbọ̀! (Welcome!) ${firstName}`,
        // dynamicTemplateData: {
        //     firstName,
        //     lastName,
        // },
    };
    try {
        const response = await sendgridConfig_1.default.send(messageDetails);
        return response;
    }
    catch (error) {
        console.error('Error sending sendgrid welcome email:', error.response?.body || error);
        // throw error;
    }
});
exports.default = {
    sendWelcomeFoundingListEmailService
};
