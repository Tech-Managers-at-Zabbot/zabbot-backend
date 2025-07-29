"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const nodemailer_1 = __importDefault(require("nodemailer"));
const config_1 = __importDefault(require("../../../config/config"));
const transport = nodemailer_1.default.createTransport({
    host: 'smtp.office365.com',
    port: 587,
    secure: false,
    auth: {
        user: `${config_1.default.EDEDUN_SMTP_USER_NAME}`,
        pass: `${config_1.default.EDEDUN_SMTP_PASSWORD}`,
    },
    tls: {
        rejectUnauthorized: false,
        ciphers: 'SSLv3',
    },
});
const sendMail = async (to, message, subject, actionLink, actionText) => {
    try {
        const mailOptions = {
            from: `Èdèdún AI Powered Yorùbá Platform`,
            to,
            subject,
            html: `
        <div style="width: 60%; margin: 0 auto; text-align: center; padding: 20px; border-radius: 10px; border: 2px solid gold; background-color: #fffaf0; font-family: Arial, sans-serif;">
          <h3 style="font-size: 24px; color: #d2691e; margin-bottom: 10px;">Welcome to Èdèdún!!!</h3>
          <p style="font-size: 18px; color: #8b4513; margin: 10px 0;">
            ${message}
          </p>
          ${actionLink ? `<a href="${actionLink}" style="text-decoration: none; color: white; display: inline-block; background-color: #27AE60; padding: 10px 20px; border-radius: 10px;">${actionText}</a>` : ""}
          <p style="font-size: 18px; color: #2e8b57; margin: 10px 0;">
            Best regards,<br />
            <strong style="color: #ff4500;">The Èdèdún Team</strong>
          </p>
        </div>
        `
        };
        const response = await transport.sendMail(mailOptions);
        return response;
    }
    catch (err) {
        console.error('Error sending email:', err.message);
        throw new Error(err.message);
    }
};
exports.default = {
    sendMail
};
