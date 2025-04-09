import jwt from "jsonwebtoken";
import customError from "../utils/customError.js";

export const getToken = (payload, expiresIn) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn,
    issuer: process.env.APP_NAME
  });
}

export const verifyToken = (token) => {
  try {
    const data = jwt.verify(token, process.env.JWT_SECRET);
    return data;
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      throw new customError("Token expired", 401);
    } else {
      throw new customError("Authentication error", 400);
    }
  }
};

// const parseExpiration = (expiration) => {
//   if (typeof expiration === "string") {
//     const match = expiration.match(/^(\d+)([dhm])$/); // Format: number + unit (d, h, m)
//     if (match) {
//       const value = parseInt(match[1], 10);
//       const unit = match[2];
//       switch (unit) {
//         case "d": // Days to seconds
//           return value * 24 * 60 * 60;
//         case "h": // Hours to seconds
//           return value * 60 * 60;
//         case "m": // Minutes to seconds
//           return value * 60;
//         default:
//           throw new Error("Invalid time unit");
//       }
//     }
//     throw new Error("Invalid expiration format");
//   }
//   return parseInt(expiration, 10); // If it's already in seconds
// };

// export const getVerifyToken = (userId) => {
//   const expiresIn = '10m';
//   const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
//     expiresIn: '10m',
//     issuer: process.env.APP_NAME
//   });
  
//   return { token, expiresIn: parseExpiration(expiresIn) };
// }

// export const getToken = (userId) => {
//   const accessToken = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
//     expiresIn: process.env.JWT_ACCESS_EXPIRATION,
//     issuer: process.env.APP_NAME
//   });

//   const refreshToken = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
//     expiresIn: process.env.JWT_REFRESH_EXPIRATION,
//     issuer: process.env.APP_NAME,
//   });

//   const expiresIn = parseExpiration(process.env.JWT_ACCESS_EXPIRATION);

//   return {
//     tokenType: 'Bearer',
//     expiresIn, accessToken, refreshToken
//   }
// };