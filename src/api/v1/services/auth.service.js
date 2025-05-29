import prisma from "../utils/prisma.js";
import customError from "../utils/customError.js";
import dayjs from "dayjs";
import { comparePassword, hashPassword } from "../utils/hash.js";
import { generateRandom } from "../utils/random.js";
import { sendEmailVerification, sendResetPassword } from "../utils/mailer.js";
import { getToken } from "../utils/jwt.js";
import { getGoogleInfo, getGoogleToken, setCredential } from "../utils/google.js";
import { getMALProfile, getMALToken } from "../utils/mal.js";

const getUserData = (user) => {
  const expiresIn = process.env.JWT_REFRESH_EXPIRATION || '28d';
  const token = getToken({ id: user.id, type: 'auth_token' }, expiresIn);
  return { 
    id: user.id, 
    email: user.email, 
    username: user.username, 
    isVerified: user.isVerifed, 
    ...(user.picture && { picture: user.picture }),
    token 
  };
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
    let username = email.split('@')[0];
    let isUnique = false;
    if (!username) {
      while(!isUnique) {
        if (await prisma.user.findUnique({ where: { username } })) {
          username = email.split('@')[0] + generateRandom(4, 'numeric');
        } else {
          isUnique = true;
        }
      }
    }
    

    // Create account
    const hashedPassword = await hashPassword(password);
    const otpCode = generateRandom(6, 'numeric');
    const otpExpiration = dayjs().add(10, "minute").toISOString();
    const user = await prisma.user.create({
      data: { 
        username, email, password: hashedPassword, otpCode, otpExpiration,
      }
    });

    // Send email verification to user
    await sendEmailVerification(user.email, user.otpCode);
    
    return getUserData(user);
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
    const otpCode = generateRandom(6, 'numeric');
    const otpExpiration = dayjs().add(10, "minute").toISOString();
    const user = await prisma.user.update({ 
      where: { id },
      data: { otpCode, otpExpiration }
    });
    
    if (!user.email) {
      throw new customError('Email address not found', 404);
    }

    await sendEmailVerification(user.email, user.otpCode);
    
    return getUserData(user);
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

    return getUserData(user);
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

    return getUserData(user);
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
    const otpCode = generateRandom(6, 'numeric');
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

    return getUserData(user);
  } catch(err) {
    console.log("Error in the resetPassword service");
    if (err.code === "P2025") {
      throw new customError('Invalid token or account', 400);
    }
    throw err;
  }
}

export const loginWithGoogle = async (code) => {
  try {
    // Get data from google
    const { access_token, refresh_token, expiry_date } = await getGoogleToken(code);
    await setCredential(access_token, refresh_token, expiry_date);
    const { id, email, picture } = await getGoogleInfo();

    let user = await prisma.user.findUnique({ where: { googleId: id.toString() }});
    if (!user) user = await prisma.user.findUnique({ where: { email }});
    let statusCode = 200;
    if (user) { 
      // If email found, either connected to google or not
      user = await prisma.user.update({ 
        where: { id: user.id },
        data: { 
          googleId: id,
          googleEmail: email,
          ...(!user.password && email && { email }),
          ...(!user.picture && picture && { picture })
        }
      })
      
      return { ...getUserData(user), statusCode };
    } 
    
    // Generate username
    let username = email.split('@')[0];
    let isUnique = false;
    while(!isUnique) {
      if (await prisma.user.findUnique({ where: { username } })) {
        username = email.split('@')[0] + generateRandom(4, 'numeric');
      } else {
        isUnique = true;
      }
    }

    // Create new user account
    const otpCode = generateRandom(6, 'numeric');
    const otpExpiration = dayjs().add(10, "minute").toISOString();
    user = await prisma.user.create({
      data: { 
        username, email, otpCode, otpExpiration, isVerifed: true, // account without password
        googleId: id, googleEmail: email, ...(picture && { picture })
      }
    });

    return { ...getUserData(user), statusCode: 201 };
  } catch(err) {
    console.log("Error in the loginWithGoogle service");
    if (err.code === "P2025") {
      throw new customError('Invalid token or account', 400);
    }
    throw err;
  }
}

export const connectToGoogle = async (userId, code) => {
  try {
    if (!userId) {
      throw new customError('Logged in user only', 401)
    }

    // Get information from Google
    const { access_token, refresh_token, expiry_date } = await getGoogleToken(code);
    await setCredential(access_token, refresh_token, expiry_date);
    const { id, email, picture } = await getGoogleInfo();

    // Find user
    let user = await prisma.user.findUnique({
      where: { id: userId }
    });
    if (!user) {
      throw new customError('User not found or no permission to update', 403);
    }

    // Connect user to google
    user = await prisma.user.update({ 
      where: { id: userId },
      data: {
        isVerifed: true,
        googleId: id.toString(),
        googleEmail: email,
        ...(!user.password && email && { email }),
        ...(!user.picture && picture && { picture })
      }
    });

    return { ...getUserData(user), googleId: user.googleId, googleEmail: email }
  } catch(err) {
    console.log("Error in the connectToGoogle service");
    if (err.code === 'P2002' && err.meta?.target?.includes('google_id')) {
      throw new customError('This Google account is already connected to another user', 409);
    }
    throw err;
  }
}

export const loginWithMAL = async (code) => {
  try {
    // Get data from MyAnimeList
    const { access_token, refresh_token, expiry_date } = await getMALToken(code);
    // await setCredential(access_token, refresh_token, expiry_date);
    let { id, name, picture } = await getMALProfile(access_token);
    id = id.toString();

    let user = await prisma.user.findUnique({ where: { malId: id } });
    if (user) { 
      user = await prisma.user.update({
        where: { id: user.id },
        data: { 
          malAccessToken: access_token,
          malRefreshToken: refresh_token,
          ...(!user.picture && picture && { picture })
        }
      })
      return { ...getUserData(user), statusCode: 200 };
    } 
    
    // Generate username
    let username = name;
    let isUnique = false;
    while(!isUnique) {
      if (await prisma.user.findUnique({ where: { username } })) {
        username = name + generateRandom(4, 'numeric');
      } else {
        isUnique = true;
      }
    }

    // Create new user account
    const otpCode = generateRandom(6, 'numeric');
    const otpExpiration = dayjs().add(10, "minute").toISOString();
    user = await prisma.user.create({
      data: { 
        username, otpCode, otpExpiration, isVerifed: true, // account without email and password
        malId: id, malAccessToken: access_token, malRefreshToken: refresh_token, 
        ...(picture && { picture })
      }
    });

    return { ...getUserData(user), statusCode: 201 };
  } catch(err) {
    console.log("Error in the loginWithMAL service", err);
    if (err.code === "P2025") {
      throw new customError('Invalid token or account', 400);
    }
    throw err;
  }
}

export const connectToMAL = async (userId, code) => {
  try {
    if (!userId) {
      throw new customError('Logged in user only', 401)
    }

    // Get information fro MAL
    const { access_token, refresh_token } = await getMALToken(code);
    let myAnimeList = await getMALProfile(access_token);

    // Connect user to MAL
    const user = await prisma.user.update({ 
      where: { id: userId },
      data: {
        malAccessToken: access_token,
        malRefreshToken: refresh_token,
        malId: myAnimeList.id.toString(),
        isVerifed: true
      }
    });

    return { ...getUserData(user), myAnimeList }
  } catch(err) {
    console.log("Error in the connectToMAL service");
    if (err.code === 'P2002' && err.meta?.target?.includes('mal_id')) {
      throw new customError('This MyAnimeList account is already connected to another user', 409);
    } else if (err.code === 'P2025') {
      throw new customError('User not found or no permission to update', 403);
    }
    throw err;
  }
}

export const isAuthenticated = async (id) => {
  try {
    let user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new customError('User not found', 400)
    }
    user = getUserData(user);
    delete user.token;

    return user;
  } catch(err) {
    console.log("Error in the isAuthenticated service", err);
    throw err;
  }
}