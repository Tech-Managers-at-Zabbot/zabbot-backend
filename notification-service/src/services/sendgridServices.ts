import { errorUtilities, helpersUtilities, responseUtilities } from '../../../shared/utilities';
import sendgridDetails from "../config/sendgridConfig";
import { SendgridListTypes, SendgridListName } from "../constants/enums";
import { nodemailerService } from '../services'

const listIdMap: Record<SendgridListName, string | undefined> = {
    [SendgridListName.FOUNDERS_LIST]: process.env.SENDGRID_FOUNDERS_LIST_ID,
    [SendgridListName.CONTRIBUTORS]: process.env.SENDGRID_CONTRIBUTORS_LIST_ID,
    [SendgridListName.BETA_TESTERS]: process.env.SENDGRID_BETA_TESTERS_LIST_ID,
    [SendgridListName.UPDATES]: process.env.SENDGRID_UPDATES_LIST_ID,
};

const sendWelcomeFoundingListEmailService = errorUtilities.withServiceErrorHandling(
    async (email: string, firstName: string, lastName: string, country:string) => {

        const token = helpersUtilities.generateToken({ email }, '30d')
        const unsubscribeUrl = `${process.env.UNSUBSCRIBE_URL}/founders-circle/unsubscribe?token=${token}`;

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
            await addToSendGridFoundersList(email, firstName, lastName, country);
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
    country: string
) => {
    const data = {
        contacts: [
            {
                email,
                first_name: firstName,
                last_name: lastName,
                country
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

// const removeFromSengridFoundersListService = errorUtilities.withServiceErrorHandling(async (email: string) => {

//     try {
//         const data = {
//             emails: [email],
//         }
//         const [findContact]: any = await sendgridDetails.sendgridClient.request({
//             method: "POST",
//             url: `/v3/marketing/contacts/search/emails`,
//             body: data,
//         });

//         if (findContact?.statusCode !== 200) {
//             throw errorUtilities.createError('Process failed, please try again later', findContact.statusCode);
//         }

//         const sendgridUserId = findContact?.body?.result[email]?.contact?.id

//         if (!sendgridUserId) {
//             throw errorUtilities.createError('User not found', 404);
//         }

//         const userFirstName = findContact?.body?.result[email]?.contact?.first_name;
//         const userLastName = findContact?.body?.result[email]?.contact?.last_name;

//         const queryParams = { contact_ids: sendgridUserId }

//         const deleteResponse = await sendgridDetails.sendgridClient.request({
//             method: 'DELETE',
//             url: `/v3/marketing/lists/${process.env.SENDGRID_FOUNDERS_LIST_ID!}/contacts`,
//             qs: queryParams,
//         });

//         if (deleteResponse[0].statusCode !== 202 && deleteResponse[0].statusCode !== 204) {
//             throw errorUtilities.createError('Process failed, please try again later', deleteResponse[0].statusCode);
//         }

//         await sendgridDetails.sendgridClient.request({
//             method: 'DELETE',
//             url: `/v3/marketing/lists/${process.env.SENDGRID_BETA_TESTERS_LIST_ID!}/contacts`,
//             qs: queryParams,
//         });

//          await sendgridDetails.sendgridClient.request({
//             method: 'DELETE',
//             url: `/v3/marketing/lists/${process.env.SENDGRID_CONTRIBUTORS_LIST_ID!}/contacts`,
//             qs: queryParams,
//         });

//           await sendgridDetails.sendgridClient.request({
//             method: 'DELETE',
//             url: `/v3/marketing/lists/${process.env.SENDGRID_UPDATES_LIST_ID!}/contacts`,
//             qs: queryParams,
//         });

//         const unsubscribeData = {
//             contacts: [
//                 {
//                     email,
//                     first_name: userFirstName,
//                     last_name: userLastName,
//                 },
//             ],
//             list_ids: [process.env.SENDGRID_FOUNDERS_LIST_ID!],
//         };

//         const addResponse = await sendgridDetails.sendgridClient.request({
//             method: 'PUT',
//             url: `/v3/marketing/contacts`,
//             body: unsubscribeData
//         });


//         if (addResponse[0].statusCode !== 202) {
//             throw errorUtilities.createError('Process failed, please try again later', addResponse[0].statusCode);
//         }

//         return responseUtilities.handleServicesResponse(
//             200,
//             'Successfully processed unsubscription',
//         );

//     } catch (error: any) {
//         console.error('Error Unsubscribing:', error.response?.body || error);
//         throw errorUtilities.createError(`Error Unsubscribing: ${error.response?.body || error}`, 500);
//     }

// });

const rollbackDeleteOperations = async (
    email: string,
    firstName: string,
    lastName: string,
    userCountry: string,
    completedListIds: string[]
) => {
    console.log('Starting rollback for completed operations:', completedListIds);

    if (completedListIds.length === 0) return;

    try {
        const rollbackData = {
            contacts: [
                {
                    email,
                    first_name: firstName,
                    last_name: lastName,
                    country: userCountry
                },
            ],
            list_ids: completedListIds,
        };

        const rollbackResponse = await sendgridDetails.sendgridClient.request({
            method: 'PUT',
            url: `/v3/marketing/contacts`,
            body: rollbackData
        });

        if (rollbackResponse[0].statusCode === 202) {
            console.log('Rollback successful: User re-added to', completedListIds.length, 'lists');
        } else {
            console.error('Rollback failed with status:', rollbackResponse[0].statusCode);
        }
    } catch (rollbackError: any) {
        console.error('Critical error during rollback:', rollbackError);
        // You might want to log this to a monitoring system or database
        // for manual intervention
    }
};

const removeFromSengridFoundersListService = errorUtilities.withServiceErrorHandling(async (email: string) => {
    let completedOperations: string[] = [];

    try {
        const data = {
            emails: [email],
        }
        const [findContact]: any = await sendgridDetails.sendgridClient.request({
            method: "POST",
            url: `/v3/marketing/contacts/search/emails`,
            body: data,
        });

        if (findContact?.statusCode !== 200) {
            throw errorUtilities.createError('Process failed, please try again later', findContact.statusCode);
        }

        const sendgridUserId = findContact?.body?.result[email]?.contact?.id

        if (!sendgridUserId) {
            throw errorUtilities.createError('User not found', 404);
        }

        const userFirstName = findContact?.body?.result[email]?.contact?.first_name;
        const userLastName = findContact?.body?.result[email]?.contact?.last_name;
        const userCountry = findContact?.body?.result[email]?.contact?.country;

        const queryParams = { contact_ids: sendgridUserId }

        // Define all delete operations
        const deleteOperations = [
            {
                listId: process.env.SENDGRID_FOUNDERS_LIST_ID!,
                name: 'FOUNDERS_LIST'
            },
            {
                listId: process.env.SENDGRID_BETA_TESTERS_LIST_ID!,
                name: 'BETA_TESTERS_LIST'
            },
            {
                listId: process.env.SENDGRID_CONTRIBUTORS_LIST_ID!,
                name: 'CONTRIBUTORS_LIST'
            },
            {
                listId: process.env.SENDGRID_UPDATES_LIST_ID!,
                name: 'UPDATES_LIST'
            }
        ];

        // Execute all delete operations with transaction-like behavior
        for (const operation of deleteOperations) {
            try {
                const deleteResponse = await sendgridDetails.sendgridClient.request({
                    method: 'DELETE',
                    url: `/v3/marketing/lists/${operation.listId}/contacts`,
                    qs: queryParams,
                });

                if (deleteResponse[0].statusCode !== 202 && deleteResponse[0].statusCode !== 204) {
                    throw new Error(`Delete failed for ${operation.name}: Status ${deleteResponse[0].statusCode}`);
                }

                completedOperations.push(operation.listId);

            } catch (operationError: any) {
                console.error(`Error deleting from ${operation.name}:`, operationError);

                await rollbackDeleteOperations(email, userFirstName, userLastName, userCountry, completedOperations);

                throw errorUtilities.createError(
                    `Transaction failed during ${operation.name} deletion. All operations rolled back.`,
                    500
                );
            }
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
            await rollbackDeleteOperations(email, userFirstName, userLastName, userCountry, completedOperations);
            throw errorUtilities.createError('Failed to add to unsubscribe list. All operations rolled back.', addResponse[0].statusCode);
        }

        return responseUtilities.handleServicesResponse(
            200,
            'Successfully processed unsubscription',
        );

    } catch (error: any) {
        console.error('Error Unsubscribing:', error.response?.body || error);
        throw errorUtilities.createError(`Error Unsubscribing: ${error.response?.body || error}`, 500);
    }
});

const addToSendGridBetaTestersListService = errorUtilities.withServiceErrorHandling(async (
    userDetails: Record<string, any>
) => {
    const {
        email,
        firstName,
        lastName,
        country
    } = userDetails;

    const data = {
        contacts: [
            {
                email,
                first_name: `${firstName}`,
                last_name: `${lastName}`,
                country: country
            },
        ],
        list_ids: [process.env.SENDGRID_BETA_TESTERS_LIST_ID!],
    };

    try {
        const [response] = await sendgridDetails.sendgridClient.request({
            method: 'PUT',
            url: '/v3/marketing/contacts',
            body: data,
        });

        if (response?.statusCode === 200 || response?.statusCode === 202) {
            return responseUtilities.handleServicesResponse(200, 'User added successful')
        }
        return response;
    } catch (error: any) {
        console.error(`Error adding contact ${firstName} to update list:`, error.response?.body?.errors[0]?.message && error.response?.body);
        throw errorUtilities.createError(`${error.response?.body?.errors[0]?.message}`, 500);
    }
});

const addToSendGridContributorsListService = errorUtilities.withServiceErrorHandling(async (
    userDetails: Record<string, any>
) => {
    const {
        email,
        firstName,
        lastName,
        country
    } = userDetails;

    const data = {
        contacts: [
            {
                email,
                first_name: `${firstName}`,
                last_name: `${lastName}`,
                country: country
            },
        ],
        list_ids: [process.env.SENDGRID_CONTRIBUTORS_LIST_ID!],
    };

    try {
        const [response] = await sendgridDetails.sendgridClient.request({
            method: 'PUT',
            url: '/v3/marketing/contacts',
            body: data,
        });
        if (response?.statusCode === 200 || response?.statusCode === 202) {
            return responseUtilities.handleServicesResponse(200, 'User added successful')
        }
        return response;
    } catch (error: any) {
        console.error(`Error adding contact ${firstName} to contributors list:`, error.response?.body?.errors[0]?.message && error.response?.body);
        throw errorUtilities.createError(`${error.response?.body?.errors[0]?.message}`, 500);
    }
});

const addToSendGridUpdatesListService = errorUtilities.withServiceErrorHandling(async (
    userDetails: Record<string, any>
) => {

    const {
        email,
        firstName,
        lastName,
        country
    } = userDetails;

    const data = {
        contacts: [
            {
                email,
                first_name: `${firstName}`,
                last_name: `${lastName}`,
                country: country
            },
        ],
        list_ids: [process.env.SENDGRID_UPDATES_LIST_ID!],
    };

    try {
        const [response] = await sendgridDetails.sendgridClient.request({
            method: 'PUT',
            url: '/v3/marketing/contacts',
            body: data,
        });
        if (response?.statusCode === 200 || response?.statusCode === 202) {
            return responseUtilities.handleServicesResponse(200, 'User added successful')
        }
        return response;
    } catch (error: any) {
        console.error(`Error adding contact ${firstName} to update list:`, error.response?.body?.errors[0]?.message && error.response?.body);
        throw errorUtilities.createError(`${error.response?.body?.errors[0]?.message}`, 500);
    }
});

const addCustomFieldToSendgridList = errorUtilities.withServiceErrorHandling(async (
    fieldData: Record<string, any>
) => {
    const { fieldName, fieldType, listName } = fieldData;

    const listId = listIdMap[listName as SendgridListName];

    if (!listId) {
        throw errorUtilities.createError(`Missing list ID for list: ${listName}`, 500);
    }

    const data = {
        name: fieldName,
        field_type: fieldType,
        list_ids: [listId],
    };

    try {
        const [response] = await sendgridDetails.sendgridClient.request({
            method: 'POST',
            url: '/v3/marketing/field_definitions',
            body: data,
        });

        console.log('Adding Field', response);
        return response;
    } catch (error: any) {
        console.error(`1 Error adding field to ${listName} list:`, error.response?.body?.errors[0]?.message);
        throw errorUtilities.createError(`${error.response?.body?.errors[0]?.message}`, 500);
    }
});

const sendWelcomeEmailWithOtpService = errorUtilities.withServiceErrorHandling(
    async (email: string, firstName: string, otp: string) => {

        // const messageDetails = {
        //     to: email,
        //     from: {
        //         email: process.env.SENDGRID_FROM_EMAIL!,
        //         name: process.env.SENDGRID_FROM_NAME!,
        //     },
        //     templateId: process.env.SENDGRID_WELCOME_EMAIL_TEMPLATE_ID!,
        //     dynamic_template_data: {
        //         otp,
        //         firstName
        //     },
        //     subject: `Ẹ káàbọ̀! (Welcome!) ${firstName}`,
        //     trackingSettings: {
        //         subscriptionTracking: {
        //             enable: false,
        //             // substitutionTag: "<%asm_group_unsubscribe_raw_url%>",
        //             // substitutionTag: "{{{unsubscribe}}}"
        //         },
        //         // asm: {
        //         //     group_id: parseInt(process.env.SENDGRID_UNSUBSCRIBE_GROUP_ID || '0'),
        //         //     groups_to_display: [parseInt(process.env.SENDGRID_UNSUBSCRIBE_GROUP_ID || '0')]
        //         // },
        //         //              customArgs: {
        //         //   unsubscribe: unsubscribeUrl
        //         // }
        //     },
        // };

        // try {
        //     const emailResponse = await sendgridDetails.sendgridMail.send(messageDetails);
        //     console.log('Email sent:', emailResponse[0]?.statusCode);
        //     return emailResponse;
        // } catch (error: any) {
        //     console.error('SendGrid error:', error.response?.body || error);
        //     throw error;
        // }

        const messageDetails = {
            to: email,
            from: process.env.SENDGRID_FROM_EMAIL!,
            subject: `Ẹ káàbọ̀! (Welcome!) ${firstName}`,
            text: `Hello ${firstName},\n\nYour OTP is: ${otp}\n\nThank you!`,
            html: `<p>Hello ${firstName},</p><p>Welcome to Zabbot</p><p>Your OTP is: <strong>${otp}</strong></p><p>Thank you!</p>`,
        }

        try {
            const emailResponse = await nodemailerService.sendEmailService(messageDetails);
            console.log('Email sent:', emailResponse);
            return responseUtilities.handleServicesResponse(200, 'Email sent successfully', emailResponse);
        } catch (error: any) {
            console.error('Nodemailer error:', error);
            // throw errorUtilities.createError(`Failed to send email: ${error.message}`, 500);
        }

    }
);


const sendgridResendOtpService = errorUtilities.withServiceErrorHandling(
    async (email: string, firstName: string, otp: string) => {

        // const messageDetails = {
        //     to: email,
        //     from: {
        //         email: process.env.SENDGRID_FROM_EMAIL!,
        //         name: process.env.SENDGRID_FROM_NAME!,
        //     },
        //     templateId: process.env.SENDGRID_RESEND_OTP_EMAIL_TEMPLATE_ID!,
        //     dynamic_template_data: {
        //         otp,
        //         firstName
        //     },
        //     subject: `Ẹ káàbọ̀! (Welcome!) ${firstName}`,
        //     trackingSettings: {
        //         subscriptionTracking: {
        //             enable: false,
        //             // substitutionTag: "<%asm_group_unsubscribe_raw_url%>",
        //             // substitutionTag: "{{{unsubscribe}}}"
        //         },
        //         // asm: {
        //         //     group_id: parseInt(process.env.SENDGRID_UNSUBSCRIBE_GROUP_ID || '0'),
        //         //     groups_to_display: [parseInt(process.env.SENDGRID_UNSUBSCRIBE_GROUP_ID || '0')]
        //         // },
        //         //              customArgs: {
        //         //   unsubscribe: unsubscribeUrl
        //         // }
        //     },
        // };

        // try {
        //     const emailResponse = await sendgridDetails.sendgridMail.send(messageDetails);
        //     console.log('Email sent:', emailResponse[0]?.statusCode);
        //     return emailResponse;
        // } catch (error: any) {
        //     console.error('SendGrid error:', error.response?.body || error);
        //     throw error;
        // }

         const messageDetails = {
            to: email,
            from: process.env.SENDGRID_FROM_EMAIL!,
            subject: `Ẹ káàbọ̀! (Welcome!) ${firstName}`,
            text: `Hello ${firstName},\n\nYour new OTP is: ${otp}\n\nThank you!`,
            html: `<p>Hello ${firstName},</p><p>Welcome to Zabbot</p><p>Your OTP is: <strong>${otp}</strong></p><p>Thank you!</p>`,
        }

        try {
            const emailResponse = await nodemailerService.sendEmailService(messageDetails);
            console.log('Email sent:', emailResponse);
            return responseUtilities.handleServicesResponse(200, 'Email sent successfully', emailResponse);
        } catch (error: any) {
            console.error('Nodemailer error:', error);
            // throw errorUtilities.createError(`Failed to send email: ${error.message}`, 500);
        }
    }
);

const sendgridSendPasswordResetLinkService = errorUtilities.withServiceErrorHandling(
    async (email: string, resetUrl: string, firstName:string) => {

        // const messageDetails = {
        //     to: email,
        //     from: {
        //         email: process.env.SENDGRID_FROM_EMAIL!,
        //         name: process.env.SENDGRID_FROM_NAME!,
        //     },
        //     templateId: process.env.SENDGRID_RESEND_OTP_EMAIL_TEMPLATE_ID!,
        //     dynamic_template_data: {
        //         otp,
        //         firstName
        //     },
        //     subject: `Ẹ káàbọ̀! (Welcome!) ${firstName}`,
        //     trackingSettings: {
        //         subscriptionTracking: {
        //             enable: false,
        //             // substitutionTag: "<%asm_group_unsubscribe_raw_url%>",
        //             // substitutionTag: "{{{unsubscribe}}}"
        //         },
        //         // asm: {
        //         //     group_id: parseInt(process.env.SENDGRID_UNSUBSCRIBE_GROUP_ID || '0'),
        //         //     groups_to_display: [parseInt(process.env.SENDGRID_UNSUBSCRIBE_GROUP_ID || '0')]
        //         // },
        //         //              customArgs: {
        //         //   unsubscribe: unsubscribeUrl
        //         // }
        //     },
        // };

        // try {
        //     const emailResponse = await sendgridDetails.sendgridMail.send(messageDetails);
        //     console.log('Email sent:', emailResponse[0]?.statusCode);
        //     return emailResponse;
        // } catch (error: any) {
        //     console.error('SendGrid error:', error.response?.body || error);
        //     throw error;
        // }

         const messageDetails = {
            to: email,
            from: process.env.SENDGRID_FROM_EMAIL!,
            subject: `Reset your Zabbot password `,
            // text: `Hello ${firstName},\n\nYou requested to reset your password, please click on the link below to reset your password \n\nThank you!`,
            html: `<p>Hello ${firstName},</p><p>Click the link to reset your password <a href="${resetUrl}" target="_blank">Reset Password.</a></p><br /><br /><p>The Link expires in Ten (10) minutes.</p><br /><br /><p>Thank you!</p>`,
        }

        try {
            const emailResponse = await nodemailerService.sendEmailService(messageDetails);
            console.log('Email sent:', emailResponse);
            return responseUtilities.handleServicesResponse(200, 'Email sent successfully', emailResponse);
        } catch (error: any) {
            console.error('Nodemailer error:', error);
            throw errorUtilities.createError(`Failed to send email: ${error.message}, please try again`, 500);
        }
    }
);

const sendgridSendPasswordResetConfirmationService = errorUtilities.withServiceErrorHandling(
    async (email: string, firstName:string) => {

        // const messageDetails = {
        //     to: email,
        //     from: {
        //         email: process.env.SENDGRID_FROM_EMAIL!,
        //         name: process.env.SENDGRID_FROM_NAME!,
        //     },
        //     templateId: process.env.SENDGRID_RESEND_OTP_EMAIL_TEMPLATE_ID!,
        //     dynamic_template_data: {
        //         otp,
        //         firstName
        //     },
        //     subject: `Ẹ káàbọ̀! (Welcome!) ${firstName}`,
        //     trackingSettings: {
        //         subscriptionTracking: {
        //             enable: false,
        //             // substitutionTag: "<%asm_group_unsubscribe_raw_url%>",
        //             // substitutionTag: "{{{unsubscribe}}}"
        //         },
        //         // asm: {
        //         //     group_id: parseInt(process.env.SENDGRID_UNSUBSCRIBE_GROUP_ID || '0'),
        //         //     groups_to_display: [parseInt(process.env.SENDGRID_UNSUBSCRIBE_GROUP_ID || '0')]
        //         // },
        //         //              customArgs: {
        //         //   unsubscribe: unsubscribeUrl
        //         // }
        //     },
        // };

        // try {
        //     const emailResponse = await sendgridDetails.sendgridMail.send(messageDetails);
        //     console.log('Email sent:', emailResponse[0]?.statusCode);
        //     return emailResponse;
        // } catch (error: any) {
        //     console.error('SendGrid error:', error.response?.body || error);
        //     throw error;
        // }

         const messageDetails = {
            to: email,
            from: process.env.SENDGRID_FROM_EMAIL!,
            subject: `Password Reset Successfully`,
            // text: `Hello ${firstName},\n\nYou requested to reset your password, please click on the link below to reset your password \n\nThank you!`,
            html: `<p>Hello ${firstName},</p><br />
            <p>Your password has been reset successfully.</p>
            <br /><p>Thank you!</p>`,
        }

        try {
            const emailResponse = await nodemailerService.sendEmailService(messageDetails);
            console.log('Email sent:', emailResponse);
            return responseUtilities.handleServicesResponse(200, 'Email sent successfully', emailResponse);
        } catch (error: any) {
            console.error('Nodemailer error:', error);
            // throw errorUtilities.createError(`Failed to send email: ${error.message}, please try again`, 500);
        }
    }
);

export default {
    sendWelcomeFoundingListEmailService,
    addToSendGridFoundersList,
    removeFromSengridFoundersListService,
    addToSendGridBetaTestersListService,
    addToSendGridContributorsListService,
    addToSendGridUpdatesListService,
    addCustomFieldToSendgridList,
    sendWelcomeEmailWithOtpService,
    sendgridResendOtpService,
    sendgridSendPasswordResetLinkService,
    sendgridSendPasswordResetConfirmationService
}