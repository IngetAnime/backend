import nodemailer from "nodemailer";
import path from "path";
import ejs from "ejs";
import { getToken } from "./jwt.js";
import formData from "form-data";
import Mailgun from "mailgun.js";

const mailPath = "src/api/v1/views/mail";

export const sendEmail = async (to, subject, html) => {
  const mailgun = new Mailgun(formData);
  const mg = mailgun.client({
    username: "api",
    key: process.env.MAILGUN_API_KEY
  });

  try {
    const data = await mg.messages.create(process.env.MAILGUN_DOMAIN, {
      from: `${process.env.APP_NAME} <postmaster@${process.env.MAILGUN_DOMAIN}>`,
      to,
      subject,
      html
    })

    return data;
  } catch(err) {
    console.log(err);
    throw err;
  }
}

export const sendEmailVerification = async (email, otp) => {
  const emailTemplatePath = path.resolve(`${mailPath}/emailVerification.ejs`);
  const resetLink = `${process.env.CLIENT_URL}/auth/email-verification?token=${getToken({ email, otp, type: 'email_verification' }, '10m')}`
  const htmlContent = await ejs.renderFile(emailTemplatePath, { resetLink });
  sendEmail(email, 'IngetAnime', htmlContent);
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
  sendEmail(email, 'IngetAnime', htmlContent);
}

export const sendBstationScheduleReport = async (email, updatedPlatforms) => {
  const emailTemplatePath = path.resolve(`${mailPath}/bstationScheduleReport.ejs`);
  const htmlContent = await ejs.renderFile(emailTemplatePath, { updatedPlatforms });
  sendEmail(email, 'Daily Bstation Schedule Report', htmlContent);
}