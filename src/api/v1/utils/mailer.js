import nodemailer from "nodemailer";
import path from "path";
import ejs from "ejs";
import { getToken } from "./jwt.js";

const mailPath = "src/api/v1/views/mail";

export const sendEmail = (to, subject, html) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.MAILER_USER,
      pass: process.env.MAILER_PASSWORD,
    },
  });
  transporter.sendMail(
    {
      from: process.env.MAILER_USER,
      to,
      subject,
      html,
    },
    (error, info) => {
      if (error) {
        throw error;
      } else {
        return info;
      }
    }
  );
}

export const sendEmailVerification = async (email, otp) => {
  const emailTemplatePath = path.resolve(`${mailPath}/emailVerification.ejs`);
  const resetLink = `${process.env.CLIENT_URL}/auth/email-verification?token=${getToken({ email, otp, type: 'email_verification' }, '10m')}`
  const htmlContent = await ejs.renderFile(emailTemplatePath, { resetLink });
  sendEmail(email, 'Email Verification', htmlContent);
}

export const sendResetPassword = async (email, otp) => {
  const emailTemplatePath = path.resolve(`${mailPath}/resetPassword.ejs`);
  const resetLink = `${process.env.CLIENT_URL}/auth/forgot-password?token=${getToken({ email, otp, type: 'reset_password' }, '10m')}`
  const htmlContent = await ejs.renderFile(emailTemplatePath, { resetLink });
  sendEmail(email, 'Reset Password', htmlContent);
}

export const sendOTP = async (email, otp) => {
  const emailTemplatePath = path.resolve(`${mailPath}/otpRegister.ejs`);
  const htmlContent = await ejs.renderFile(emailTemplatePath, { otp });
  sendEmail(email, 'Email Verification', htmlContent);
}