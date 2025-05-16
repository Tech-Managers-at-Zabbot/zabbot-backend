import dotenv from 'dotenv';
import path from 'path';
import sendgridMail from '@sendgrid/mail';
import sendgridClient from '@sendgrid/client';


dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

sendgridMail.setApiKey(process.env.SENDGRID_API_KEY!)
sendgridClient.setApiKey(process.env.SENDGRID_API_KEY!)


export default {sendgridMail, sendgridClient};