import express, { Request, Response } from 'express';
import { mailChimpServices, sendgridMailServices } from '../services'
import { errorUtilities, helpersUtilities, responseUtilities } from '../../../shared/utilities';

const app = express();


export const mailChimpExecuteFoundingListNotification = errorUtilities.withControllerErrorHandling(async (request: Request, response: Response) => {
  const { email, firstName, lastName } = request.body;
  const newEmail: any = await mailChimpServices.handleMailingListSubscriptionService(email, firstName, lastName);
  // console.log('New email:', newEmail);
});

export const sendgridExecuteFoundingListNotification = errorUtilities.withControllerErrorHandling(async (request: Request, response: Response) => {
  const { email, firstName, lastName } = request.body;
  const newEmail: any = await sendgridMailServices.sendWelcomeFoundingListEmailService(email, firstName, lastName);
  // console.log('New email:', newEmail);
})

export const sendgridUnsubscribeFoundingListNotification = errorUtilities.withControllerErrorHandling(async (request: Request, response: Response) => {

  const { email } = request.body;

  const unsubscribe: any = await sendgridMailServices.removeFromSengridFoundersListService(email);

  return responseUtilities.responseHandler(
    response,
    unsubscribe.message,
    unsubscribe.statusCode,
    unsubscribe.data
  );
})

export const addFieldToListController = errorUtilities.withControllerErrorHandling(async (request: Request, response: Response) => {

  const addField: any = await sendgridMailServices.addCustomFieldToSendgridList(request.body)
  return responseUtilities.responseHandler(
    response,
    addField.message,
    addField.statusCode,
    addField.data
  );
})

const addUsersToUpdateListController = errorUtilities.withControllerErrorHandling(async (request: Request, response: Response) => {
  const addUserToUpdate: any = await sendgridMailServices.addToSendGridUpdatesListService(request.body)
  return responseUtilities.responseHandler(
    response,
    addUserToUpdate.message,
    addUserToUpdate.statusCode,
    addUserToUpdate.data
  );
})

const addUsersToContributorsController = errorUtilities.withControllerErrorHandling(async (request: Request, response: Response) => {
  const addUserToContribuotrs: any = await sendgridMailServices.addToSendGridContributorsListService(request.body)
  return responseUtilities.responseHandler(
    response,
    addUserToContribuotrs.message,
    addUserToContribuotrs.statusCode,
    addUserToContribuotrs.data
  );
})

const addUsersToTestersController = errorUtilities.withControllerErrorHandling(async (request: Request, response: Response) => {
  const addUserToTesters: any = await sendgridMailServices.addToSendGridBetaTestersListService(request.body)
  return responseUtilities.responseHandler(
    response,
    addUserToTesters.message,
    addUserToTesters.statusCode,
    addUserToTesters.data
  );
})

export default {
  mailChimpExecuteFoundingListNotification,
  sendgridExecuteFoundingListNotification,
  sendgridUnsubscribeFoundingListNotification,
  addFieldToListController,
  addUsersToUpdateListController,
  addUsersToContributorsController,
addUsersToTestersController
}