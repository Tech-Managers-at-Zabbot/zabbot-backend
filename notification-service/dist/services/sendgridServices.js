"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addToSendGridFoundersList = void 0;
const utilities_1 = require("../../../shared/utilities");
const sendgridConfig_1 = __importDefault(require("../config/sendgridConfig"));
const sendWelcomeFoundingListEmailService = utilities_1.errorUtilities.withServiceErrorHandling(async (email, firstName, lastName) => {
    console.log('Sending email to:', email, firstName, lastName);
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
        trackingSettings: {
            subscriptionTracking: {
                enable: true,
                substitutionTag: "<%asm_group_unsubscribe_raw_url%>",
            },
        },
    };
    try {
        const emailResponse = await sendgridConfig_1.default.sendgridMail.send(messageDetails);
        await (0, exports.addToSendGridFoundersList)(email, firstName, lastName);
        console.log('Email sent:', emailResponse[0]?.statusCode);
        return emailResponse;
    }
    catch (error) {
        console.error('SendGrid error:', error.response?.body || error);
        throw error;
    }
});
exports.addToSendGridFoundersList = utilities_1.errorUtilities.withServiceErrorHandling(async (email, firstName, lastName, listId) => {
    const data = {
        contacts: [
            {
                email,
                first_name: firstName,
                last_name: lastName,
            },
        ],
        list_ids: [process.env.SENDGRID_FOUNDERS_LIST_ID],
    };
    try {
        const [response] = await sendgridConfig_1.default.sendgridClient.request({
            method: 'PUT',
            url: '/v3/marketing/contacts',
            body: data,
        });
        console.log('adding user', response?.statusCode);
        return response;
    }
    catch (error) {
        console.error('Error adding to SendGrid list:', error.response?.body || error);
        throw error;
    }
});
exports.default = {
    sendWelcomeFoundingListEmailService,
    addToSendGridFoundersList: exports.addToSendGridFoundersList
};
