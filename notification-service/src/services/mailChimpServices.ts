import mailchimp from '../config/mailChimpConfig';
import mailchimpTransactional from '@mailchimp/mailchimp_transactional';
import { errorUtilities } from '../../../shared/utilities';
import dotenv from 'dotenv';
import path from 'path';

// const mailChimp2 = require('mailchimp_transactional');

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

export const config = {
    MAILCHIMP_API_KEY: process.env.MAILCHIMP_API_KEY,
    MAILCHIMP_SERVER_PREFIX: process.env.MAILCHIMP_SERVER_PREFIX,
    MAILCHIMP_LIST_ID_AUDIENCE_ID: process.env.MAILCHIMP_LIST_ID_AUDIENCE_ID,
    MAILCHIMP_FOUNDING_LIST_WELCOME_TEMPLATE_ID: process.env.MAILCHIMP_FOUNDING_LIST_WELCOME_TEMPLATE_ID,
    MAILCHIMP_FROM_EMAIL: process.env.MAILCHIMP_FROM_EMAIL,
    MAILCHIMP_FROM_NAME: process.env.MAILCHIMP_FROM_NAME,
    MAILCHIMP_MANDRILL_API_KEY: process.env.MAILCHIMP_MANDRILL_API_KEY,
    MAILCHIMP_FOUNDING_LIST_WELCOME_TEMPLATE_NAME: process.env.MAILCHIMP_FOUNDING_LIST_WELCOME_TEMPLATE_NAME
};

export interface EmailData {
    email: string;
    firstName: string;
    lastName: string;
}

const checkSubscriberExistsService = errorUtilities.withServiceErrorHandling(
    async (email: string) => {
        try {
            const response = await mailchimp.lists.getListMember(
                `${config.MAILCHIMP_LIST_ID_AUDIENCE_ID}`,
                email
            );
            return response.status === 'subscribed';
        } catch (error: any) {
            if (error.status === 404) {
                return false;
            }
            throw error;
        }
    }
);

const addSubscriberToListService = errorUtilities.withServiceErrorHandling(
    async (email: string, firstName: string, lastName: string) => {
        const response = await mailchimp.lists.addListMember(
            `${config.MAILCHIMP_LIST_ID_AUDIENCE_ID}`, 
            {
                email_address: email,
                status: 'subscribed',
                merge_fields: {
                    FNAME: firstName,
                    LNAME: lastName || ""
                }
            }
        );
        return response;
    }
);

const sendWelcomeFoundingListEmailService = errorUtilities.withServiceErrorHandling(
    async (email: string, firstName: string) => {
        if (!config.MAILCHIMP_MANDRILL_API_KEY) {
            throw new Error('MailChimp not initialized');
        }
        const mailchimpClient = mailchimpTransactional(`${config.MAILCHIMP_MANDRILL_API_KEY}`);
        const response: any = await mailchimpClient.messages.sendTemplate({
            template_name: `${config.MAILCHIMP_FOUNDING_LIST_WELCOME_TEMPLATE_NAME}`,
            message: {
                subject: `Ẹ káàbọ̀! (Welcome!) ${firstName}`,
                to: [{ email, type: 'to' }],
                from_email: config.MAILCHIMP_FROM_EMAIL,
                from_name: config.MAILCHIMP_FROM_NAME || 'Zabbot'
            },
            template_content: []
        });
        return response;
    }
);

const handleMailingListSubscriptionService = errorUtilities.withServiceErrorHandling(
    async (email: string, firstName: string, lastName: string) => {
        const isSubscribed = await checkSubscriberExistsService(email);
        
        if (!isSubscribed) {
            await addSubscriberToListService(email, firstName, lastName);
        }
        
        await sendWelcomeFoundingListEmailService(email, firstName);
        
        return {
            wasAlreadySubscribed: isSubscribed,
            message: isSubscribed 
                ? 'User was already subscribed, welcome email sent' 
                : 'User added to mailing list and welcome email sent'
        };
    }
);

export default {
    checkSubscriberExistsService,
    addSubscriberToListService,
    sendWelcomeFoundingListEmailService,
    handleMailingListSubscriptionService
};