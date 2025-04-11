import { verifyToken } from "../utils/jwt.js";
import customError from "../utils/customError.js";
import prisma from "../utils/prisma.js";

export const authMiddleware = async (req, res, next) => {
  try {
    const tokenFromCookie = req.cookies?.token;
    const authHeader = req.headers.authorization;

    let token = null;
    if (authHeader?.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    } else if (tokenFromCookie) {
      token = tokenFromCookie;
    } else {
      throw new customError("Token is missing", 401);
    }

    req.user = verifyToken(token);
    next();
  } catch(err) {
    console.log('Error in the middleware authMiddleware');
    if (err instanceof customError) {
      next(new customError(err.message, err.statusCode));
    } else {
      next(new customError('Invalid token', 400));
    }
  }
};

export const optAuthMiddleware = async (req, res, next) => {
  try {
    const tokenFromCookie = req.cookies?.token;
    const authHeader = req.headers.authorization;

    let token = null;
    if (authHeader?.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    } else if (tokenFromCookie) {
      token = tokenFromCookie;
    }

    if (token) {
      req.user = verifyToken(token);
      if (req.user.type !== 'auth_token') {
        next(new customError('Invalid token type', 403));
      }
    }
    next();
  } catch(err) {
    console.log('Error in the middleware authMiddleware');
    if (err instanceof customError) {
      next(new customError(err.message, err.statusCode));
    } else {
      next(new customError('Invalid token', 400));
    }
  }
};

export const authHandler = async (req, res, next) => {
  const { type } = req.user;
  if (type === 'auth_token') {
    next()
  } else {
    next(new customError('Invalid token type', 403));
  }
}

export const emailVerificationhHandler = async (req, res, next) => {
  const { type } = req.user;
  if (type === 'email_verification') {
    next()
  } else {
    next(new customError('Invalid token type', 403));
  }
}

export const resetPasswordHandler = async (req, res, next) => {
  const { type } = req.user;
  if (type === 'reset_password') {
    next()
  } else {
    next(new customError('Invalid token type', 403));
  }
}

export const adminHandler = async (req, res, next) => {
  const { id } = req.user;
  const { role } = await prisma.user.findUnique({
    where: { id }
  })
  if (role === 'admin') {
    next()
  } else {
    next(new customError('Admin only', 403))
  }
}

  // const { authorization } = req.headers;
  // const token = authorization && authorization.split(" ")[1];

  // if (!token) {
  //   const error = new customError("Token is missing", 401);
  //   return next(error);
  // }

  // try {
  //   const { id } = verifyToken(token);
  //   req.user = await prisma.user.findUnique({ where: { id } });
  //   next();
  // } catch (err) {
  //   console.error("Error verifying token:", err);
    
  //   if (err instanceof customError) {
  //     return next(new customError(err.message, err.statusCode));
  //   }

  //   next(new customError("Invalid token", 400));
  // }
// };