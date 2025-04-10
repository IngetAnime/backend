import bcrypt from "bcrypt";

export const hashPassword = async (password) => {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
}

export const comparePassword = async (plainPassword, hashedPassword) => {
  try {
    if (!hashedPassword) {
      return false;
    }
    return await bcrypt.compare(plainPassword, hashedPassword);
  } catch(err) {
    console.log(err);
  }
}