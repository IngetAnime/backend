import { z } from "zod";
import { validate, email, password, username, identifier, confirmPassword, code, link } from './index.validator.js';

export const register = validate(
  z.object({
    email,
    password,
    confirmPassword,
    username: username.optional()
  }).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })
, 'body');

export const login = validate(
  z.object({
    identifier,
    password: confirmPassword,
  })
, 'body');

export const forgotPassword = validate(
  z.object({
    identifier
  })
, 'body');

export const resetPassword = validate(
  z.object({
    newPassword: password,
    confirmPassword,
  }).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })
, 'body');

export const codeValidator = validate(
  z.object({
    code,
  })
, 'body');