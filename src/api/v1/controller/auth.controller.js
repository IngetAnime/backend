import * as services from '../services/auth.service.js';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration.js';
import { generateGoogleAuthUrl } from '../utils/google.js';
import { generateMALAuthUrl } from '../utils/mal.js';

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

export const getGoogleAuthUrl = async (req, res, next) => {
  try {
    const authorizationUrl = generateGoogleAuthUrl();
    res.status(200).json({ authorizationUrl });
  } catch(err) {
    console.log("Error in the getGoogleAuthUrl controller");
    next(err);
  }
}

export const loginWithGoogle = async (req, res, next) => {
  try {
    const { code } = req.body;
    const {token, statusCode, ...data } = await services.loginWithGoogle(code);
    setAuthCookie(res, token)
    res.status(statusCode).json({ ...data });
  } catch(err) {
    console.log("Error in the loginWithGoogle controller");
    next(err);
  }
}

export const getMALAuthUrl = async (req, res, next) => {
  try {
    const authorizationUrl = generateMALAuthUrl();
    res.status(200).json({ authorizationUrl });
  } catch(err) {
    console.log("Error in the getMALAuthUrl controller");
    next(err);
  }
}

export const loginWithMAL = async (req, res, next) => {
  try {
    const { code } = req.body;
    const { token, statusCode, ...data } = await services.loginWithMAL(code);
    setAuthCookie(res, token)
    res.status(statusCode).json({ ...data });
  } catch(err) {
    console.log("Error in the loginWithMAL controller");
    next(err);
  }
}

export const isAuthenticated = async (req, res, next) => {
  try {
    const { id } = req.user;
    const data = await services.isAuthenticated(id);
    res.status(200).json({ ...data });
  } catch(err) {
    console.log("Error in the isAuthenticated controller");
    next(err);
  }
}

export const isAdmin = async (req, res, next) => {
  try {
    const { id } = req.user;
    res.status(200).json({ id });
  } catch(err) {
    console.log("Error in the isAdmin controller");
    next(err);
  }
}