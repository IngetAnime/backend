import customError from '../utils/customError.js';

export const generateMALAuthUrl = () => {
  const url = new URL('https://myanimelist.net/v1/oauth2/authorize');
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: process.env.MAL_CLIENT_ID,
    state: process.env.MAL_STATE,
    redirect_uri: `${process.env.BASE_URL}/mal/callback`,
    code_challenge: process.env.MAL_CODE_CHALLENGE,
    code_challenge_method: 'plain',
  });
  return `${url}?${params.toString()}`;
};

export const getMALToken = async (code) => {
  try {
    const url = 'https://myanimelist.net/v1/oauth2/token';
    const params = new URLSearchParams({
      client_id: process.env.MAL_CLIENT_ID,
      client_secret: process.env.MAL_CLIENT_SECRET,
      grant_type: 'authorization_code',
      redirect_uri: `${process.env.BASE_URL}/mal/callback`,
      code_verifier: process.env.MAL_CODE_CHALLENGE,
      code
    });
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: params.toString()
    })
    const data = await response.json();
    if (!response.ok) {
      throw {
        status: response.status,
        ...(data.message && { message: data.message }),
        ...(data.error && { error: data.error })
      }
    };
    return data;
  } catch(err) {
    console.log('Failed to get MyAnimeList token');
    throw new customError(`Error response from MyAnimeList: ${err.message || err.error}`, err.status, err.error || err);
  }
}

export const getMALProfile = async (access_token) => {
  try {
    const url = 'https://api.myanimelist.net/v2/users/@me?fields=anime_statistics';
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Bearer ${access_token}`
      }
    })
    const data = await response.json();
    if (!response.ok) {
      throw {
        status: response.status,
        ...(data.message && { message: data.message }),
        ...(data.error && { error: data.error })
      }
    };
    return data;
  } catch(err) {
    console.log('Failed to connet to MyAnimeList API');
    throw new customError(`Error response from MyAnimeList: ${err.message || err.error}`, err.status, err.error || err);
  }
}