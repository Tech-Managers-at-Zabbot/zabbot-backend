import express, { Request, Response } from 'express';
import { mailChimpServices, sendgridMailServices } from '../services'
import { responseUtilities } from '../../../shared/utilities';

const app = express();


export const mailChimpExecuteFoundingListNotification = async (request: Request, response: Response) => {
  const { email, firstName, lastName } = request.body;
  const newEmail: any = await mailChimpServices.handleMailingListSubscriptionService(email, firstName, lastName);
  // console.log('New email:', newEmail);
};

export const sendgridExecuteFoundingListNotification = async (request: Request, response: Response) => {
  const { email, firstName, lastName } = request.body;
  const newEmail: any = await sendgridMailServices.sendWelcomeFoundingListEmailService(email, firstName, lastName);
  // console.log('New email:', newEmail);
}



export default{
    mailChimpExecuteFoundingListNotification,
    sendgridExecuteFoundingListNotification
}