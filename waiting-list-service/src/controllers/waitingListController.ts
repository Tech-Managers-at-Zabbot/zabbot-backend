import { Request, Response } from 'express';
import WaitingList from '../entities/waitingList';
import { v4 } from 'uuid';
import axios from 'axios';
import dotenv from 'dotenv';
import path from 'path';
import { errorUtilities, helpersUtilities } from '../../../shared/utilities';

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

export const config = {
  NOTIFICATION_SERVICE_ROUTE: process.env.NOTIFICATION_SERVICE_ROUTE
};

export const joinWaitingList = async (request: Request, response: Response) => {
  try {
    const { name, email, country, sendUpdates, betaTest, contributeSkills } = request.body;

    if (!name || !email || !country) {
      response.status(400).json({ message: 'Name, email, and country are required' });
      return;
    }

    if (!sendUpdates && !betaTest && !contributeSkills) {
      response.status(400).json({ message: 'Please select at least one option' });
      return;
    }

    const existingUser = await WaitingList.findOne({ where: { email } });

    if (existingUser) {
      response.status(409).json({ message: 'Email already exists in founders list' });
      return;
    }

    const newEntry = await WaitingList.create({
      id: v4(),
      name,
      email,
      country,
      sendUpdates,
      betaTest,
      contributeSkills
    });

    response.status(201).json({
      message: 'Successfully joined founders list',
      data: newEntry
    });

    const emailData = {
      email,
      firstName: name.split(' ')[0],
      lastName: name.split(' ')[1] || "",
      country
    }

    axios.post(`${config.NOTIFICATION_SERVICE_ROUTE}/founding-list/welcome-sendgrid`, emailData)

    if (sendUpdates) {
      axios.post(`${config.NOTIFICATION_SERVICE_ROUTE}/founding-list/add-to-update-list`, emailData)
    }

    if (betaTest) {
      axios.post(`${config.NOTIFICATION_SERVICE_ROUTE}/founding-list/add-to-testers-list`, emailData)
    }

    if (contributeSkills) {
      axios.post(`${config.NOTIFICATION_SERVICE_ROUTE}/founding-list/add-to-contributors-list`, emailData)
    }

  } catch (error: any) {
    console.error(error);
    if (error.name === 'SequelizeValidationError') {
      response.status(400).json({
        message: 'Validation error',
        errors: error.errors.map((err: any) => err.message)
      });
      return;
    }
    response.status(500).json({ message: 'Server error' });
  }
};


export const unsubscribeWaitingList = async (request: Request, response: Response) => {
  try {
    const { token }: any = request.query;

    if (!token) {
      throw errorUtilities.createError('Token is required', 400);
    }
    const decodedDetails: any = helpersUtilities.validateToken(token);

    if (!decodedDetails) {
      console.error('Invalid token');
      throw errorUtilities.createError('Error, please try again', 400);
    }

    const { email } = decodedDetails.data;

    if (!email) {
      throw errorUtilities.createError('Error, please try again', 400);
    }

    const existingUser = await WaitingList.findOne({ where: { email } });

    if (!existingUser) {
      return response.status(404).json({ message: 'Email not found in founders list' });
    }

    const sendgridResponse = await axios.post(`${config.NOTIFICATION_SERVICE_ROUTE}/founding-list/unsubscribe`, { email });

    if (sendgridResponse.status !== 200) {
      console.error('Failed to unsubscribe from SendGrid:', sendgridResponse.data, sendgridResponse.status, sendgridResponse);
      return response.status(500).json({ message: 'Failed to unsubscribe from SendGrid' });
    }

    await WaitingList.destroy({ where: { email } });

    return response.status(200).json({
      message: 'Successfully unsubscribed from founders list'
    });

  } catch (error: any) {
    console.error(error);
    if (error.name === 'SequelizeValidationError') {
      response.status(400).json({
        message: 'Validation error',
        errors: error.errors.map((err: any) => err.message)
      });
      return;
    }
    response.status(500).json({ message: 'Server error' });
  }
}

export const addUsersToRespectiveLists = async (request: Request, response: Response) => {
  try {
    const users = await WaitingList.findAll({});

    if (!users || users.length === 0) {
      return response.status(200).json({
        message: 'No users found in waiting list',
        processed: 0
      });
    }

    let processedCount = 0;
    let errorCount = 0;
    const errors: any[] = [];

    // Process each user
    for (const user of users) {
      try {
        // Split name into firstName and lastName (assuming name is full name)
        const nameParts = user.name.trim().split(' ');
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';

        const emailData = {
          email: user.email,
          firstName: firstName,
          lastName: lastName,
          country: user.country
        };

        // axios.post(`${config.NOTIFICATION_SERVICE_ROUTE}/founding-list/welcome-sendgrid`, emailData)

        const promises: Promise<any>[] = [];

        if (user.sendUpdates) {
          promises.push(
            axios.post(`${config.NOTIFICATION_SERVICE_ROUTE}/founding-list/add-to-update-list`, emailData)
              .catch(err => ({ error: 'update-list', details: err }))
          );
        }

        if (user.betaTest) {
          promises.push(
            axios.post(`${config.NOTIFICATION_SERVICE_ROUTE}/founding-list/add-to-testers-list`, emailData)
              .catch(err => ({ error: 'testers-list', details: err }))
          );
        }

        if (user.contributeSkills) {
          promises.push(
            axios.post(`${config.NOTIFICATION_SERVICE_ROUTE}/founding-list/add-to-contributors-list`, emailData)
              .catch(err => ({ error: 'contributors-list', details: err }))
          );
        }

        // Wait for all API calls for this user to complete
        if (promises.length > 0) {
          const results = await Promise.allSettled(promises);

          // Check for any failed requests
          const failedRequests = results.filter(result =>
            result.status === 'fulfilled' && result.value?.error
          );

          if (failedRequests.length > 0) {
            errors.push({
              userId: user.id,
              email: user.email,
              failures: failedRequests.map(req => (req as any).value)
            });
            errorCount++;
          } else {
            processedCount++;
          }
        } else {
          // User has no preferences selected, still count as processed
          processedCount++;
        }

      } catch (userError) {
        console.error(`Error processing user ${user.id}:`, userError);
        errors.push({
          userId: user.id,
          email: user.email,
          error: userError
        });
        errorCount++;
      }
    }

    // Return comprehensive response
    const responseData = {
      message: 'User processing completed',
      totalUsers: users.length,
      processedSuccessfully: processedCount,
      errorsEncountered: errorCount,
      ...(errors.length > 0 && { errors: errors })
    };

    if (errorCount > 0) {
      return response.status(207).json(responseData); // 207 Multi-Status
    }

    return response.status(200).json(responseData);

  } catch (error: any) {
    console.error(error);
    if (error.name === 'SequelizeValidationError') {
      response.status(400).json({
        message: 'Validation error',
        errors: error.errors.map((err: any) => err.message)
      });
      return;
    }
    response.status(500).json({ message: 'Server error' });
  }
}

export const getWaitingListBetaTesterUser = async (request: Request, response: Response) => {
  
  try {
    const { email } = request.query;

    if (!email || typeof email !== 'string') {
      return response.status(400).json({ error: 'Valid email is required' });
    }

    const user = await WaitingList.findOne({ where: { email } });

    if (!user) {
      return response.status(404).json({ message: 'User not found in waiting list' });
    }

    if (!user.betaTest) {
      return response.status(403).json({ message: 'User is not part of the beta testers' });
    }

    return response.status(200).json({
      message: 'User found',
      data: user
    });

  } catch (error: any) {
    console.error('💥 Beta tester check error:', error);
    console.error('📚 Error stack:', error.stack);
    return response.status(500).json({ message: 'Server error', error: error.message });
  }
}