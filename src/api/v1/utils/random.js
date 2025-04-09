
import cryptoRandomString from 'crypto-random-string';

export const generateRandom = (length = 16, type, characters) => {
  return cryptoRandomString({
    length, ...(type && { type }), ...(characters && { characters })
  })
} 