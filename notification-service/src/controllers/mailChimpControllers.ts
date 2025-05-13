import express, { Request, Response } from 'express';
import { mailChimpServices } from '../services'
import { responseUtilities } from '../../../shared/utilities/';

const app = express();


export const executeFoundingListNotification = async (request: Request, response: Response) => {
    const { email, firstName, lastName } = request.body;
  const newEmail: any = await mailChimpServices.handleMailingListSubscriptionService(email, firstName, lastName);
  console.log('New email:', newEmail);
};

