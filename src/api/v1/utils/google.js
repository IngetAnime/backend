import { google } from "googleapis";
import customError from './customError.js';

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  `${process.env.BASE_URL}/google/callback`,
)

export const generateAuthorizationUrl = () => {
  const scopes = [
    // 'https://www.googleapis.com/auth/user.birthday.read',
    // 'https://www.googleapis.com/auth/user.gender.read',
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile',
  ]

  const authorizationUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    include_granted_scopes: true,
    prompt: 'consent'
  });

  return authorizationUrl;
};

export const setCredential = async (access_token, refresh_token, expiry_date) => {
  oauth2Client.setCredentials({ access_token, refresh_token, expiry_date });
}

export const getGoogleToken = async (code) => {
  let { tokens } = await oauth2Client.getToken(code);
  return tokens;
}

export const getGoogleInfo = async () => {
  try {
    const info = google.oauth2({ version: 'v2', auth: oauth2Client });
    const res = await info.userinfo.get();
    return res.data;
  } catch(err) {
    console.log('Failed to connect to Google API');
    if (err.response) {
      // API error response is available
      console.log(err.response.data);
      throw new customError(`Error response from Google: ${err.response.data.error}`, err.response.status);
    } else if (err.request) {
      // No response received
      throw new customError(`No response received from Google: ${err.message}`);
    } else {
      // Other errors
      throw new customError(`Request error: ${err.message}`);
    }
  }
}