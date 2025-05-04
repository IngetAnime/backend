import prisma from "../utils/prisma.js";
import customError from "../utils/customError.js";

export const getUserDetail = async (userId) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    })
    if (!user) {
      throw new customError('User not found', 404);
    }
    return { 
      id: user.id, 
      email: user.email, 
      username: user.username, 
      isVerified: user.isVerifed, 
      role: user.role,
      ...(user.picture && { picture: user.picture }), 
    };
  } catch(err) {
    console.log('Error in the getUserDetail service');
    throw err;
  }
}