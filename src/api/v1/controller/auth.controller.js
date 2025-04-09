import customError from '../utils/customError.js';
import * as services from '../services/auth.service.js';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration.js';

dayjs.extend(duration);

export const setAuthCookie = (res, token) => {
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
    maxAge: dayjs.duration(28, 'days').asMilliseconds(),
  });
};

export const register = async (req, res, next) => {
  try {
    const { email, password, username } = req.body;
    const { token, ...data } = await services.register(email, password, username);
    setAuthCookie(res, token);
    res.status(201).json({ ...data });
  } catch(err) {
    console.log("Error in the register controller");
    next(err);
  }
}

export const resendEmailVerification = async (req, res, next) => {
  try {
    const { id } = req.user;
    const { token, ...data } = await services.resendEmailVerification(id);
    setAuthCookie(res, token);
    res.status(200).json({ ...data });
  } catch(err) {
    console.log("Error in the resendEmailVerification controller");
    next(err);
  }
}

export const verifyEmail = async (req, res, next) => {
  try {
    const { id, email, otpCode } = req.user;
    const { token, ...data } = await services.verifyEmail(id, email, otpCode);
    setAuthCookie(res, token)
    res.status(200).json({ ...data });
  } catch(err) {
    console.log("Error in the verifyEmail controller");
    next(err);
  }
}

export const login = async (req, res, next) => {
  try {
    const { identifier, password } = req.body;
    const { token, ...data } = await services.login(identifier, password);
    setAuthCookie(res, token)
    res.status(200).json({ ...data });
  } catch(err) {
    console.log("Error in the login controller");
    next(err);
  }
}

export const logout = async (req, res, next) => {
  try {
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
    })
    res.status(200).json({});
  } catch(err) {
    console.log("Error in the logout controller");
    next(err);
  }
}

export const forgotPassword = async (req, res, next) => {
  try {
    const { identifier } = req.body
    const data = await services.forgotPassword(identifier);
    res.status(200).json({ ...data });
  } catch(err) {
    console.log("Error in the forgotPassword controller");
    next(err);
  }
}

export const resetPassword = async (req, res, next) => {
  try {
    const { newPassword } = req.body;
    const { id, email, otpCode } = req.user;
    const { token, ...data } = await services.resetPassword(id, email, otpCode, newPassword);
    setAuthCookie(res, token)
    res.status(200).json({ ...data });
  } catch(err) {
    console.log("Error in the verifyEmail controller");
    next(err);
  }
}