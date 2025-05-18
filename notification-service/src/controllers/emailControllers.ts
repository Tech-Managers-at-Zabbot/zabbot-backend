import express, { Request, Response } from 'express';
import { mailChimpServices, sendgridMailServices } from '../services'
import { errorUtilities, helpersUtilities, responseUtilities } from '../../../shared/utilities';

const app = express();


export const mailChimpExecuteFoundingListNotification = errorUtilities.withControllerErrorHandling( async (request: Request, response: Response) => {
  const { email, firstName, lastName } = request.body;
  const newEmail: any = await mailChimpServices.handleMailingListSubscriptionService(email, firstName, lastName);
  // console.log('New email:', newEmail);
});

export const sendgridExecuteFoundingListNotification = errorUtilities.withControllerErrorHandling( async (request: Request, response: Response) => {
  const { email, firstName, lastName } = request.body;
  const newEmail: any = await sendgridMailServices.sendWelcomeFoundingListEmailService(email, firstName, lastName);
  // console.log('New email:', newEmail);
})

export const sendgridUnsubscribeFoundingListNotification = errorUtilities.withControllerErrorHandling( async (request: Request, response: Response) => {

  const { email } = request.body;

  const unsubscribe: any = await sendgridMailServices.removeFromSengridFoundersListService(email);

   return responseUtilities.responseHandler(
    response,
    unsubscribe.message,
    unsubscribe.statusCode,
    unsubscribe.data
  );
})



export default{
    mailChimpExecuteFoundingListNotification,
    sendgridExecuteFoundingListNotification,
    sendgridUnsubscribeFoundingListNotification
}