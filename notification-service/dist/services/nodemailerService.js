"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const nodemailer_1 = __importDefault(require("nodemailer"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, '../../../.env') });
const transporter = nodemailer_1.default.createTransport({
    host: process.env.SENDGRID_SMTP_HOST,
    port: 587, // or 465 for SSL
    secure: false,
    auth: {
        user: process.env.SENDGRID_SMTP_USERNAME,
        pass: process.env.SENDGRID_API_KEY,
    },
});
// const mailOptions = {
//   from: 'you@yourdomain.com',
//   to: 'recipient@example.com',
//   subject: 'Test email via SendGrid SMTP',
//   text: 'This is a test email sent using Nodemailer and SendGrid SMTP.',
// };
const sendEmailService = async (options) => {
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
};
// transporter.sendMail(mailOptions, (error, info) => {
//   if (error) {
//     console.error('Error:', error);
//   } else {
//     console.log('Email sent:', info.response);
//   }
// });
exports.default = {
    sendEmailService
};
