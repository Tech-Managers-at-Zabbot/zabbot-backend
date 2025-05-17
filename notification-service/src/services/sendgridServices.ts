import { errorUtilities, helpersUtilities, responseUtilities } from '../../../shared/utilities';
import sendgridDetails from "../config/sendgridConfig";

const sendWelcomeFoundingListEmailService = errorUtilities.withServiceErrorHandling(
    async (email: string, firstName: string, lastName: string) => {

        const token = helpersUtilities.generateToken({ email }, '30d')
        const unsubscribeUrl = `${process.env.DEV_FRONTEND_URL}/founders-circle/unsubscribe?token=${token}`;

        const messageDetails = {
            to: email,
            from: {
                email: process.env.SENDGRID_FROM_EMAIL!,
                name: process.env.SENDGRID_FROM_NAME!,
            },
            templateId: process.env.SENDGRID_FOUNDING_LIST_WELCOME_TEMPLATE_ID!,
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
            const emailResponse = await sendgridDetails.sendgridMail.send(messageDetails);
            await addToSendGridFoundersList(email, firstName, lastName);
            console.log('Email sent:', emailResponse[0]?.statusCode);
            return emailResponse;
        } catch (error: any) {
            console.error('SendGrid error:', error.response?.body || error);
            throw error;
        }
    }
);


const addToSendGridFoundersList = errorUtilities.withServiceErrorHandling(async (
    email: string,
    firstName: string,
    lastName: string,
    listId: string
) => {
    const data = {
        contacts: [
            {
                email,
                first_name: firstName,
                last_name: lastName,
            },
        ],
        list_ids: [process.env.SENDGRID_FOUNDERS_LIST_ID!],
    };

    try {
        const [response] = await sendgridDetails.sendgridClient.request({
            method: 'PUT',
            url: '/v3/marketing/contacts',
            body: data,
        });
        console.log('adding user', response?.statusCode)
        return response;
    } catch (error: any) {
        console.error('Error adding to SendGrid list:', error.response?.body || error);
        throw error;
    }
});


const removeFromFoundersListService = errorUtilities.withServiceErrorHandling(async (email: string) => {

    try{
    const data = {
        emails: [email],
    }
    const [findContact]: any = await sendgridDetails.sendgridClient.request({
        method: "POST",
        url: `/v3/marketing/contacts/search/emails`,
        body: data,
    });

    if(findContact?.statusCode !== 200) {
        throw errorUtilities.createError('Process failed, please try again later', findContact.statusCode);
    }

    const sendgridUserId = findContact?.body?.result[email]?.contact?.id

    if (!sendgridUserId) {
        throw errorUtilities.createError('User not found', 404);
    }

    const userFirstName = findContact?.body?.result[email]?.contact?.first_name;
    const userLastName = findContact?.body?.result[email]?.contact?.last_name;

    const queryParams = { contact_ids: sendgridUserId }

    // 1. Remove from founders list
    const deleteResponse = await sendgridDetails.sendgridClient.request({
        method: 'DELETE',
        url: `/v3/marketing/lists/${process.env.SENDGRID_FOUNDERS_LIST_ID!}/contacts`,
        // `/v3/contactdb/lists/${process.env.SENDGRID_FOUNDERS_LIST_ID!}/recipients/${sendgridUserId}`
        // `/v3/marketing/lists/${process.env.SENDGRID_FOUNDERS_LIST_ID!}/contacts`,
        // `/v3/contactdb/lists/${list_id}/recipients/${recipient_id}`
        qs: queryParams,
    });

    // console.log('Delete response:', sendgridUserId, findContact?.body?.result[email]?.contact);

    // Successful removal returns 202 or 204
    if (deleteResponse[0].statusCode !== 202 && deleteResponse[0].statusCode !== 204) {
        throw errorUtilities.createError('Process failed, please try again later', deleteResponse[0].statusCode);
    }

     const unsubscribeData = {
        contacts: [
            {
                email,
                first_name: userFirstName,
                last_name: userLastName,
            },
        ],
        list_ids: [process.env.SENDGRID_FOUNDERS_LIST_ID!],
    };

    const addResponse = await sendgridDetails.sendgridClient.request({
        method: 'PUT',
        url: `/v3/marketing/contacts`,
        body: unsubscribeData
    });


    if (addResponse[0].statusCode !== 202) {
        throw errorUtilities.createError('Process failed, please try again later', addResponse[0].statusCode);
    }

    return responseUtilities.handleServicesResponse(
        200,
        'Successfully processed unsubscription',
    );

    }catch(error: any) {
        console.error('Error adding to Unsubscribing:', error.response?.body || error);
        throw errorUtilities.createError(`Error adding to Unsubscribing: ${error.response?.body || error}`, 500);
    }

});

export default {
    sendWelcomeFoundingListEmailService,
    addToSendGridFoundersList,
    removeFromFoundersListService
}