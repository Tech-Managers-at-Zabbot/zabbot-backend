import { errorUtilities } from '../../../shared/utilities';
import sendgridMail from "../config/sendgridConfig";

const sendWelcomeFoundingListEmailService = errorUtilities.withServiceErrorHandling(
    async (email: string, firstName: string, lastName: string) => {
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
            // dynamicTemplateData: {
            //     firstName,
            //     lastName,
            // },
        };

        try {
            const response = await sendgridMail.send(messageDetails);
            return response;
        } catch (error:any) {
            console.error('Error sending sendgrid welcome email:', error.response?.body || error);
            // throw error;
        }
    }
);


export default {
    sendWelcomeFoundingListEmailService
}