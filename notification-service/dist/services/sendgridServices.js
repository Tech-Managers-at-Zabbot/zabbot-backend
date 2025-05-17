"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const utilities_1 = require("../../../shared/utilities");
const sendgridConfig_1 = __importDefault(require("../config/sendgridConfig"));
const sendWelcomeFoundingListEmailService = utilities_1.errorUtilities.withServiceErrorHandling(async (email, firstName, lastName) => {
    console.log('Sending email to:', email, firstName, lastName);
    const token = utilities_1.helpersUtilities.generateToken({ email }, '30d');
    const unsubscribeUrl = `${process.env.PRODUCTION_FRONTEND_URL}/founders-circle/unsubscribe?${token}`;
    console.log('Unsubscribe URL:', unsubscribeUrl);
    const messageDetails = {
        to: email,
        from: {
            email: process.env.SENDGRID_FROM_EMAIL,
            name: process.env.SENDGRID_FROM_NAME,
        },
        templateId: process.env.SENDGRID_FOUNDING_LIST_WELCOME_TEMPLATE_ID,
        dynamic_template_data: {
            unsubscribe_url: unsubscribeUrl
        },
        subject: `Ẹ káàbọ̀! (Welcome!) ${firstName}`,
        trackingSettings: {
            subscriptionTracking: {
                enable: false,
                // substitutionTag: "<%asm_group_unsubscribe_raw_url%>",
                // substitutionTag: "{{{unsubscribe}}}"
            },
            asm: {
                group_id: parseInt(process.env.SENDGRID_UNSUBSCRIBE_GROUP_ID || '0'),
                groups_to_display: [parseInt(process.env.SENDGRID_UNSUBSCRIBE_GROUP_ID || '0')]
            },
            //              customArgs: {
            //   unsubscribe: unsubscribeUrl
            // }
        },
    };
    try {
        const emailResponse = await sendgridConfig_1.default.sendgridMail.send(messageDetails);
        await addToSendGridFoundersList(email, firstName, lastName);
        console.log('Email sent:', emailResponse[0]?.statusCode);
        return emailResponse;
    }
    catch (error) {
        console.error('SendGrid error:', error.response?.body || error);
        throw error;
    }
});
const addToSendGridFoundersList = utilities_1.errorUtilities.withServiceErrorHandling(async (email, firstName, lastName, listId) => {
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
const removeFromFoundersListService = utilities_1.errorUtilities.withServiceErrorHandling(async (email) => {
    // 1. Remove from founders list
    const deleteResponse = await sendgridConfig_1.default.sendgridClient.request({
        method: 'DELETE',
        url: `/v3/marketing/lists/${process.env.SENDGRID_FOUNDERS_LIST_ID}/contacts`,
        body: {
            contact_ids: [email]
        },
    });
    // Successful removal returns 202 or 204
    if (deleteResponse[0].statusCode !== 202 && deleteResponse[0].statusCode !== 204) {
        throw utilities_1.errorUtilities.createError('Process failed, please try again later', deleteResponse[0].statusCode);
    }
    // 2. Add to unsubscribe list
    const addResponse = await sendgridConfig_1.default.sendgridClient.request({
        method: 'PUT',
        url: `/v3/marketing/contacts`,
        body: {
            contacts: [{ email }],
            list_ids: [process.env.SENDGRID_UNSUBSCRIBE_GROUP_ID]
        },
    });
    // Successful addition returns 202
    if (addResponse[0].statusCode !== 202) {
        throw utilities_1.errorUtilities.createError('Process failed, please try again later', addResponse[0].statusCode);
    }
    console.log(`Successfully processed unsubscription for ${email}`);
    return utilities_1.responseUtilities.handleServicesResponse(200, 'Successfully processed unsubscription');
});
exports.default = {
    sendWelcomeFoundingListEmailService,
    addToSendGridFoundersList,
    removeFromFoundersListService
};
