import { errorUtilities } from '../../../shared/utilities';
import sendgridDetails from "../config/sendgridConfig";

const sendWelcomeFoundingListEmailService = errorUtilities.withServiceErrorHandling(
    async (email: string, firstName: string, lastName: string) => {
        console.log('Sending email to:', email, firstName, lastName);
        const fromEmail = process.env.SENDGRID_FROM_EMAIL!;
        const fromName = process.env.SENDGRID_FROM_NAME!;
        const templateId = process.env.SENDGRID_FOUNDING_LIST_WELCOME_TEMPLATE_ID!;

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


export const addToSendGridFoundersList = errorUtilities.withServiceErrorHandling(async (
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

export default {
    sendWelcomeFoundingListEmailService,
    addToSendGridFoundersList
}