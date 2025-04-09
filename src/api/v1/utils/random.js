
const generateRandomString = (length, characters) => {
  let str = '';
  for (let i=0; i<length; i++) {
    const getRandomIndex = Math.floor(Math.random() * characters.length)
    str += characters[getRandomIndex]
  }
  return str;
}

export const generateOTP = (length = 6) => {
  const characters = '0123456789';
  return generateRandomString(length, characters);
}

export const generateUsername = (length = 8) => {
  const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  return 'user_' + generateRandomString(length, characters);
} 