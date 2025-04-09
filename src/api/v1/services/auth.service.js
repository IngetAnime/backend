import prisma from "../lib/prisma.js";
import customError from "../utils/customError.js";
import dayjs from "dayjs";
import { comparePassword, hashPassword } from "../utils/hash.js";
import { generateOTP, generateUsername } from "../utils/random.js";
import { sendEmailVerification, sendResetPassword } from "../lib/nodemailer.js";
import { getToken } from "../utils/jwt.js";

const getUserData = (user) => {
  const expiresIn = process.env.JWT_REFRESH_EXPIRATION || '28d';
  const token = getToken({ id: user.id, type: 'auth_token' }, expiresIn);
  return { id: user.id, email: user.email, username: user.username, isVerified: user.isVerifed, token };
}

const maskString = (string) => {
  const length = string.length;
  if (length <= 2) {
    return string[0] + '*'.repeat(length - 1)
  } else if (length <= 3) {
    return string[0] + '*'.repeat(length - 2) + string.slice(-1)
  } else {
    return string.slice(0, 2) + '*'.repeat(length - 3) + string.slice(-1);
  }
}

export const register = async (email, password, username) => {
  try {
    // Loop until get valid username
    if (!username) {
      username = generateUsername(8);
      let isUnique = false;
      while(!isUnique) {
        if (await prisma.user.findUnique({ where: { username } })) {
          username = generateUsername(8);
        } else {
          isUnique = true;
        }
      }
    }

    // Create account
    const hashedPassword = await hashPassword(password);
    const otpCode = generateOTP(6);
    const otpExpiration = dayjs().add(10, "minute").toISOString();
    const user = await prisma.user.create({
      data: { 
        username, email, password: hashedPassword, otpCode, otpExpiration,
      }
    });

    // Send email verification to user
    await sendEmailVerification(user.email, user.otpCode);
    
    return { ...(getUserData(user)) };
  } catch (err) {
    console.log("Error in the register service");
    if (err.code == "P2002") {
      const fields = err.meta?.target;
      if (fields.includes('username') && fields.includes('email')) {
        throw new customError("Username and email already in use", 409);
      } else if (fields.includes('username')) {
        throw new customError("Username already in use", 409);
      } else if (fields.includes('email')) {
        throw new customError("Email already in use", 409);
      }
    }
    throw err;
  }
}

export const resendEmailVerification = async (id) => {
  try {
    // Update OTP
    const otpCode = generateOTP(6);
    const otpExpiration = dayjs().add(10, "minute").toISOString();
    const user = await prisma.user.update({ 
      where: { id },
      data: { otpCode, otpExpiration }
    });
    
    await sendEmailVerification(user.email, user.otpCode);
    
    return { ...(getUserData(user)) };
  } catch(err) {
    console.log("Error in the resendEmailVerification service");
    if (err.code === "P2025") {
      throw new customError("Invalid user authentication", 404);
    }
    throw err;
  }
}

export const verifyEmail = async (id, email, otpCode) => {
  try {
    let user = await prisma.user.findUnique({
      where: { id, email, otpCode }
    })
    if (!user) {
      throw new customError('Invalid token or account', 400);
    }

    const isOTPExpired = dayjs() > dayjs(user.otpExpiration)
    if (isOTPExpired) {
      throw new customError('Token has expired', 400)
    }

    user = await prisma.user.update({
      where: { id: user.id },
      data: { isVerifed: true }
    })

    return { ...(getUserData(user)) };
  } catch(err) {
    console.log("Error in the verifyEmail service");
    throw err;
  }
}

export const login = async (identifier, password) => {
  try {
    const user = await prisma.user.findFirst({ where: { 
      OR: [
        { username: identifier },
        { email: identifier }
      ] 
    }});
    if (!user || !await comparePassword(password, user.password)) {
      throw new customError('Invalid email, username, or password', 400);
    }

    return { ...(getUserData(user)) };
  } catch(err) {
    console.log("Error in the login service");
    throw err;
  }
}

export const forgotPassword = async (identifier) => {
  try {
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { username: identifier },
          { email: identifier }
        ]
      }
    });
    if (!user) {
      throw new customError("User not found", 404);
    }

    // Create new otp for reset password
    const otpCode = generateOTP(6);
    const otpExpiration = dayjs().add(10, "minute").toISOString();
    user = await prisma.user.update({ 
      where: { id: user.id },
      data: { otpCode, otpExpiration }
    });

    await sendResetPassword(user.email, user.otpCode);

    // Masking user's email and username
    const [local, domain] = user.email.split('@');
    const email = `${maskString(local)}@${domain}`;
    const username = `${maskString(user.username)}`;

    return { id: user.id, email, username };
  } catch(err) {
    console.log("Error in the forgotPassword service");
    throw err;
  }
}

export const resetPassword = async (id, email, otpCode, newPassword) => {
  try {
    const hashedPassword = await hashPassword(newPassword);
    const user = await prisma.user.update({
      where: { id, email, otpCode },
      data: { password: hashedPassword }
    })

    const isOTPExpired = dayjs() > dayjs(user.otpExpiration)
    if (isOTPExpired) {
      throw new customError('Token has expired', 400)
    }

    return { ...(getUserData(user)) };
  } catch(err) {
    if (err.code === "P2025") {
      throw new customError('Invalid token or account', 400);
    }
    console.log("Error in the resetPassword service");
    throw err;
  }
}

// console.log(await register('ahmadsubhandaryhadi@gmail.com', '12341234', 'ahmadsubhand'))
// console.log(await resendEmailVerification(16))
// console.log(await verifyEmail(16, 'ahmadsubhandaryhadi@gmail.com', '801853'))
// console.log(await login('ahmadsubhandaryhadi@gmail.com', '12341234'))
// console.log(await forgotPassword('ahmadsubhandaryhadi@gmail.com'))
// console.log(await resetPassword(16, 'ahmadsubhandaryhadi@gmail.com', '091616', '12341234'))