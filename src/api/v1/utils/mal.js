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
  if (!response.ok) throw new Error(data.error_description || 'Failed to authenticate');
  return data;
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
    if (!response.ok) throw new Error(data.error_description || 'Failed to authenticate');
    return data;
  } catch(err) {
    console.log('Failed to connect to MyAnimeList API');
    if (err.response) {
      // API error response is available
      console.log(err.response.data);
      throw new customError(`Error response from MyAnimeList: ${err.response.data.error}`, err.response.status);
    } else if (err.request) {
      // No response received
      throw new customError(`No response received from MyAnimeList: ${err.message}`);
    } else {
      // Other errors
      throw new customError(`Request error: ${err.message}`);
    }
  }
}