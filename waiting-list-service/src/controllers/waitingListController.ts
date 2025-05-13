import { Request, Response } from 'express';
import WaitingList from '../entities/waitingList';
import { v4 } from 'uuid';
import axios from 'axios';
import dotenv from 'dotenv';
import path from 'path';

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

      const mailChimpData = {
        email,
        firstName: name.split(' ')[0],
        lastName: name.split(' ')[1] || ""
      }

       axios.post(`${config.NOTIFICATION_SERVICE_ROUTE}/founding-list/welcome`, mailChimpData)


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