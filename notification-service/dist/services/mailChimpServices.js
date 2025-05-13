"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const mailChimpConfig_1 = __importDefault(require("../config/mailChimpConfig"));
const mailchimp_transactional_1 = __importDefault(require("@mailchimp/mailchimp_transactional"));
const utilities_1 = require("../../../shared/utilities");
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, '../../../.env') });
exports.config = {
    MAILCHIMP_API_KEY: process.env.MAILCHIMP_API_KEY,
    MAILCHIMP_SERVER_PREFIX: process.env.MAILCHIMP_SERVER_PREFIX,
    MAILCHIMP_LIST_ID_AUDIENCE_ID: process.env.MAILCHIMP_LIST_ID_AUDIENCE_ID,
    MAILCHIMP_FOUNDING_LIST_WELCOME_TEMPLATE_ID: process.env.MAILCHIMP_FOUNDING_LIST_WELCOME_TEMPLATE_ID,
    MAILCHIMP_FROM_EMAIL: process.env.MAILCHIMP_FROM_EMAIL,
    MAILCHIMP_FROM_NAME: process.env.MAILCHIMP_FROM_NAME,
    MAILCHIMP_MANDRILL_API_KEY: process.env.MAILCHIMP_MANDRILL_API_KEY,
};
const checkSubscriberExistsService = utilities_1.errorUtilities.withServiceErrorHandling(async (email) => {
    try {
        const response = await mailChimpConfig_1.default.lists.getListMember(`${exports.config.MAILCHIMP_LIST_ID_AUDIENCE_ID}`, email);
        return response.status === 'subscribed';
    }
    catch (error) {
        if (error.status === 404) {
            return false;
        }
        throw error;
    }
});
const addSubscriberToListService = utilities_1.errorUtilities.withServiceErrorHandling(async (email, firstName, lastName) => {
    const response = await mailChimpConfig_1.default.lists.addListMember(`${exports.config.MAILCHIMP_LIST_ID_AUDIENCE_ID}`, {
        email_address: email,
        status: 'subscribed',
        merge_fields: {
            FNAME: firstName,
            LNAME: lastName || ""
        }
    });
    return response;
});
const sendWelcomeFoundingListEmailService = utilities_1.errorUtilities.withServiceErrorHandling(async (email, firstName) => {
    if (!exports.config.MAILCHIMP_MANDRILL_API_KEY) {
        throw new Error('MailChimp not initialized');
    }
    const mailchimpClient = (0, mailchimp_transactional_1.default)(`${exports.config.MAILCHIMP_MANDRILL_API_KEY}`);
    const response = await mailchimpClient.messages.sendTemplate({
        template_name: 'founders-circle-welcome-email', //`${config.MAILCHIMP_FOUNDING_LIST_WELCOME_TEMPLATE_ID}`,
        template_content: [],
        message: {
            to: [{ email }],
            from_email: exports.config.MAILCHIMP_FROM_EMAIL,
            from_name: exports.config.MAILCHIMP_FROM_NAME || 'Your Company Name'
        }
    });
    console.log('Welcome email sent:', response, exports.config.MAILCHIMP_MANDRILL_API_KEY, exports.config);
    return response;
});
const handleMailingListSubscriptionService = utilities_1.errorUtilities.withServiceErrorHandling(async (email, firstName, lastName) => {
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
});
exports.default = {
    checkSubscriberExistsService,
    addSubscriberToListService,
    sendWelcomeFoundingListEmailService,
    handleMailingListSubscriptionService
};
