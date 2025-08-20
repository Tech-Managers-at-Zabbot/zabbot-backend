import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });


const transporter = nodemailer.createTransport({
  host: process.env.SENDGRID_SMTP_HOST!,
  port: 587, // or 465 for SSL
  secure: false,
  auth: {
    user: process.env.SENDGRID_SMTP_USERNAME!,
    pass: process.env.SENDGRID_API_KEY!,
  },
});

// const mailOptions = {
//   from: 'you@yourdomain.com',
//   to: 'recipient@example.com',
//   subject: 'Test email via SendGrid SMTP',
//   text: 'This is a test email sent using Nodemailer and SendGrid SMTP.',
// };

const sendEmailService = async (options: any) => {
    try {
        const { to, subject, text, html } = options;
        if (!to || !subject || (!text && !html)) {
            throw new Error('Missing required email fields: to, subject, text or html');
        }
        const info = await transporter.sendMail(options);
        return {
            message: 'Email sent successfully',
            statusCode: 200,
            data: info.response
        };
    }
    catch (error) {
        console.error('Error sending email:', error);
        throw new Error('Failed to send email');
    }
}

// transporter.sendMail(mailOptions, (error, info) => {
//   if (error) {
//     console.error('Error:', error);
//   } else {
//     console.log('Email sent:', info.response);
//   }
// });

export default {
    sendEmailService
}
