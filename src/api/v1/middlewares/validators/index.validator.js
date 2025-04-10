import { z } from "zod";
import customError from '../../utils/customError.js';

// Authentication
export const email = z.string().email().nonempty()
export const password = z
  .string()
  .min(8, "Password must be at least 8 characters long")
  .max(64, "Password must not exceed 64 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one digit")
  .regex(/[@$!%*?&]/, "Password must contain at least one special character (@$!%*?&)")
export const confirmPassword = z.string().min(8, "Password must be at least 8 characters long")
export const username = z
  .string()
  .min(3, "Username must be at least 3 characters long")
  .max(20, "Username must not exceed 20 characters")
  .regex(/^(?!_)(?!.*__)[a-zA-Z0-9_]+(?<!_)$/, 
    "Username can only contain letters, numbers, and underscores, but cannot start or end with an underscore"
  )
export const identifier = z
  .string()
  .min(8, "Password must be at least 8 characters long")
  .max(64, "Password must not exceed 64 characters")
  .refine(
    (value) =>
      /^[a-zA-Z0-9_]+$/.test(value) || /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(value),
    {
      message: "Identifier must be a valid email or username",
    }
  )

export const validate = (schema, payload) => (req, res, next) => {
  try {
    switch (payload) {
      case 'body':
        schema.parse(req.body);
        break;
      case 'params':
        schema.parse(req.params);
        break;
      case 'query':
        schema.parse(req.query);
        break;
      default:
        schema.parse(req.body);
        break;
    }
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      // const fieldErrors = error.errors.map((issue) => ({
      //   field: issue.path.join("."),
      //   message: issue.message,
      // }));
      next(new customError('Invalid input data', 400, error))
    }
    next(error);
  }  
};