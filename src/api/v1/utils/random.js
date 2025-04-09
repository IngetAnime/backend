
import cryptoRandomString from 'crypto-random-string';

export const generateRandom = async (length = 16, type = 'ascii-printable', characters) => {
  return cryptoRandomString({
    length, type, ...(characters && { characters })
  })
} 