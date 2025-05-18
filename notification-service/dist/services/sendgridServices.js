"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const utilities_1 = require("../../../shared/utilities");
const sendgridConfig_1 = __importDefault(require("../config/sendgridConfig"));
const sendWelcomeFoundingListEmailService = utilities_1.errorUtilities.withServiceErrorHandling(async (email, firstName, lastName) => {
    const token = utilities_1.helpersUtilities.generateToken({ email }, '30d');
    const unsubscribeUrl = `${process.env.UNSUBSCRIBE_URL}/founders-circle/unsubscribe?token=${token}`;
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
const removeFromSengridFoundersListService = utilities_1.errorUtilities.withServiceErrorHandling(async (email) => {
    try {
        const data = {
            emails: [email],
        };
        const [findContact] = await sendgridConfig_1.default.sendgridClient.request({
            method: "POST",
            url: `/v3/marketing/contacts/search/emails`,
            body: data,
        });
        if (findContact?.statusCode !== 200) {
            throw utilities_1.errorUtilities.createError('Process failed, please try again later', findContact.statusCode);
        }
        const sendgridUserId = findContact?.body?.result[email]?.contact?.id;
        if (!sendgridUserId) {
            throw utilities_1.errorUtilities.createError('User not found', 404);
        }
        const userFirstName = findContact?.body?.result[email]?.contact?.first_name;
        const userLastName = findContact?.body?.result[email]?.contact?.last_name;
        const queryParams = { contact_ids: sendgridUserId };
        // 1. Remove from founders list
        const deleteResponse = await sendgridConfig_1.default.sendgridClient.request({
            method: 'DELETE',
            url: `/v3/marketing/lists/${process.env.SENDGRID_FOUNDERS_LIST_ID}/contacts`,
            qs: queryParams,
        });
        // Successful removal returns 202 or 204
        if (deleteResponse[0].statusCode !== 202 && deleteResponse[0].statusCode !== 204) {
            throw utilities_1.errorUtilities.createError('Process failed, please try again later', deleteResponse[0].statusCode);
        }
        const unsubscribeData = {
            contacts: [
                {
                    email,
                    first_name: userFirstName,
                    last_name: userLastName,
                },
            ],
            list_ids: [process.env.SENDGRID_FOUNDERS_LIST_ID],
        };
        const addResponse = await sendgridConfig_1.default.sendgridClient.request({
            method: 'PUT',
            url: `/v3/marketing/contacts`,
            body: unsubscribeData
        });
        if (addResponse[0].statusCode !== 202) {
            throw utilities_1.errorUtilities.createError('Process failed, please try again later', addResponse[0].statusCode);
        }
        return utilities_1.responseUtilities.handleServicesResponse(200, 'Successfully processed unsubscription');
    }
    catch (error) {
        console.error('Error Unsubscribing:', error.response?.body || error);
        throw utilities_1.errorUtilities.createError(`Error Unsubscribing: ${error.response?.body || error}`, 500);
    }
});
exports.default = {
    sendWelcomeFoundingListEmailService,
    addToSendGridFoundersList,
    removeFromSengridFoundersListService
};
