import prisma from "../utils/prisma.js";
import customError from "../utils/customError.js";
import { getMALProfile, getMALNewAccessToken } from "../utils/mal.js";

export const getMALConnection = async (userId) => {
  if (!userId) {
    return undefined;
  }

  const { malAccessToken, malRefreshToken } = await prisma.user.findUnique({ where: { id: userId } });
  
  if (!malAccessToken) { // If token not provided
    return undefined;
  }

  try {
    await getMALProfile(malAccessToken); // If token valid
    return malAccessToken;
  } catch(err) {
    if (err.statusCode === 401) { // If expired, exchange new token
      const { access_token, refresh_token } = await getMALNewAccessToken(malRefreshToken);
      await prisma.user.update({
        where: { id: userId },
        data: { 
          malAccessToken: access_token,
          malRefreshToken: refresh_token 
        }
      })
      
      return access_token;
    }
  }

  throw new customError('Failed to connet to MyAnimeList API', 500);
}

/* 
Parameter explanation:
- userId = user ID in the database, obtained via req.user.id from the token
- q = query string for searching purposes
- limit = maximum number of data to be returned, ranges between 100–500 (varies)
- offset = starting position of the next data for pagination
- fields = returned data fields; if left empty, at least id, title, and main_picture will be returned by default
id, title, main_picture, alternative_titles, start_date, end_date, synopsis, mean, rank, popularity, num_list_users,
num_scoring_users, nsfw, created_at, updated_at, media_type, status, genres, my_list_status, num_episodes, start_season, broadcast,
source, average_episode_duration, rating, pictures, background, related_anime, related_manga, recommendations, studios, statistics
- anime_id = the ID of the anime on MyAnimeList
- ranking_type = type of ranking, only one can be used
all, airing, upcoming, tv, ova, movie, special, bypopularity, favorite
- year = release year of the anime, example: '2025'
- season = release season of the anime, only one can be used
winter, spring, summer, fall
- sort = sorting order for displaying data, only one can be used
anime_score, anime_num_list_users
- status = user's current anime list status, only one can be used
watching, completed, on_hold, dropped, plan_to_watch
- score = score to be given to an anime (1 - 10)
- num_watched_episodes = number of episodes watched
*/

export const getAnimeList = async (user_id, q, limit, offset, fields) => {
  try {
    // Get access token from MyAnimeList
    const access_token = await getMALConnection(user_id);

    // Send request to MyAnimeList
    const url = `https://api.myanimelist.net/v2/anime`;
    const params = new URLSearchParams({ 
      q,
      ...(limit && { limit }),
      ...(offset && { offset }),
      ...(fields && { fields }),
    });
    const response = await fetch(`${url}?${params.toString()}`, {
      method: 'GET',
      headers: {
        ...( 
          access_token ? 
          { 'Authorization': `Bearer ${access_token}` } :
          { 'X-MAL-CLIENT-ID': process.env.MAL_CLIENT_ID, }
        )
      }
    });
    const data = await response.json();
    if (!response.ok) {
      throw {
        status: response.status,
        ...(data.message && { message: data.message }),
        ...(data.error && { error: data.error })
      }
    };

    // If limit and offset exist, send next page link
    if (data.paging.next) {
      const queryParams = data.paging.next.split("?")[1];
      data.paging.next = `${process.env.BASE_URL}/api/v1/mal/anime?${queryParams}`;
    }
    return data;
  } catch(err) {
    console.log('Error in the getAnimeList service');
    throw new customError(`Error response from MyAnimeList: ${err.message || err.error}`, err.status, err.error || err);
  }
}

export const getAnimeDetails = async (user_id, anime_id, fields) => {
  try {
    // Get access token from MyAnimeList
    const access_token = await getMALConnection(user_id);

    // Send request to MyAnimeList
    const url = `https://api.myanimelist.net/v2/anime/${anime_id}`;
    const params = new URLSearchParams({ ...( fields && { fields }) });
    const response = await fetch(`${url}?${params.toString()}`, {
      method: 'GET',
      headers: {
        ...( 
          access_token ? 
          { 'Authorization': `Bearer ${access_token}` } :
          { 'X-MAL-CLIENT-ID': process.env.MAL_CLIENT_ID, }
        )
      }
    });
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
    console.log('Error in the getAnimeDetails service');
    throw new customError(`Error response from MyAnimeList: ${err.message || err.error}`, err.status, err.error || err);
  }
}

export const getAnimeRanking = async (user_id, ranking_type, limit, offset, fields='') => {
  try {
    // Get access token from MyAnimeList
    const access_token = await getMALConnection(user_id);

    // Send request to MyAnimeList
    const url = `https://api.myanimelist.net/v2/anime/ranking`;
    const params = new URLSearchParams({ 
      ranking_type, 
      ...(limit && { limit }),
      ...(offset && { offset }),
      ...(fields && { fields }),
     });
    const response = await fetch(`${url}?${params.toString()}`, {
      method: 'GET',
      headers: {
        ...( 
          access_token ? 
          { 'Authorization': `Bearer ${access_token}` } :
          { 'X-MAL-CLIENT-ID': process.env.MAL_CLIENT_ID, }
        )
      }
    });
    const data = await response.json();
    if (!response.ok) {
      throw {
        status: response.status,
        ...(data.message && { message: data.message }),
        ...(data.error && { error: data.error })
      }
    };

    // If limit and offset exist, send next page link
    if (data.paging.next) {
      const queryParams = data.paging.next.split("?")[1];
      data.paging.next = `${process.env.BASE_URL}/api/v1/mal/anime?${queryParams}`;
    }
    return data;
  } catch(err) {
    console.log('Error in the getAnimeRanking service');
    throw new customError(`Error response from MyAnimeList: ${err.message || err.error}`, err.status, err.error || err);
  }
}

export const getSeasonalAnime = async (user_id, year, season, sort, limit, offset, fields='') => {
  try {
    // Get access token from MyAnimeList
    const access_token = await getMALConnection(user_id);

    // Send request to MyAnimeList
    const url = `https://api.myanimelist.net/v2/anime/season/${year}/${season}`;
    const params = new URLSearchParams({ 
      ...(sort && { sort }),
      ...(limit && { limit }),
      ...(offset && { offset }),
      ...(fields && { fields }),
    });
    const response = await fetch(`${url}?${params.toString()}`, {
      method: 'GET',
      headers: {
        ...( 
          access_token ? 
          { 'Authorization': `Bearer ${access_token}` } :
          { 'X-MAL-CLIENT-ID': process.env.MAL_CLIENT_ID, }
        )
      }
    });
    const data = await response.json();
    if (!response.ok) {
      throw {
        status: response.status,
        ...(data.message && { message: data.message }),
        ...(data.error && { error: data.error })
      }
    };

    // If limit and offset exist, send next page link
    if (data.paging.next) {
      const queryParams = data.paging.next.split("?")[1];
      data.paging.next = `${process.env.BASE_URL}/api/v1/mal/anime?${queryParams}`;
    }
    return data;
  } catch(err) {
    console.log('Error in the getSeasonalAnime service');
    throw new customError(`Error response from MyAnimeList: ${err.message || err.error}`, err.status, err.error || err);
  }
}

// User have to connect with MyAnimeList account

export const getSuggestedAnime = async (user_id, limit, offset, fields) => {
  try {
    // Get access token from MyAnimeList
    const access_token = await getMALConnection(user_id);
    if (!access_token) {
      throw new customError('Account not connected to MyAnimeList', 403);
    }

    // Send request to MyAnimeList
    const url = `https://api.myanimelist.net/v2/anime/suggestions`;
    const params = new URLSearchParams({ 
      ...(limit && { limit }),
      ...(offset && { offset }),
      ...(fields && { fields }),
    });
    const response = await fetch(`${url}?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${access_token}`
      }
    });
    const data = await response.json();
    if (!response.ok) {
      throw {
        status: response.status,
        ...(data.message && { message: data.message }),
        ...(data.error && { error: data.error })
      }
    };

    // If limit and offset exist, send next page link
    if (data.paging.next) {
      const queryParams = data.paging.next.split("?")[1];
      data.paging.next = `${process.env.BASE_URL}/api/v1/mal/anime?${queryParams}`;
    }
    return data;
  } catch(err) {
    console.log('Error in the getSuggestedAnime service');
    throw new customError(`Error response from MyAnimeList: ${err.message || err.error}`, err.status, err.error || err);
  }
}

export const updateMyAnimeListStatus = async (
  user_id, anime_id, status, score, num_watched_episodes, start_date, finish_date
) => {
  try {
    // Get access token from MyAnimeList
    const access_token = await getMALConnection(user_id);
    if (!access_token) {
      throw new customError('Account not connected to MyAnimeList', 403);
    }

    // Send request to MyAnimeList
    const url = `https://api.myanimelist.net/v2/anime/${anime_id}/my_list_status`;
    const params = new URLSearchParams({ 
      ...(status && { status }),
      ...((num_watched_episodes === 0 || num_watched_episodes) && { num_watched_episodes }),
      ...((score === 0 || score) && { score }),
      ...(
        start_date === null ? { start_date: '0000-00-00' } : 
        start_date ? { start_date } : {}
      ),
      ...(
        finish_date === null ? { finish_date: '0000-00-00' } : 
        finish_date ? { finish_date } : {}
      ),

      // ...(score && { score }),
      // ...(num_watched_episodes && { num_watched_episodes }),
      // ...(start_date && { start_date }),
      // ...(finish_date && { finish_date }),
    });
    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Bearer ${access_token}`,
      },
      body: params.toString()
    });
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
    console.log('Error in the updateMyAnimeListStatus service');
    throw new customError(`Error response from MyAnimeList: ${err.message || err.error}`, err.status, err.error || err);
  }
}

export const deleteMyAnimeListItem = async (user_id, anime_id) => {
  try {
    // Get access token from MyAnimeList
    const access_token = await getMALConnection(user_id);
    if (!access_token) {
      throw new customError('Account not connected to MyAnimeList', 403);
    }

    // Send request to MyAnimeList
    const url = `https://api.myanimelist.net/v2/anime/${anime_id}/my_list_status`;
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${access_token}`,
      },
    });
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
    console.log('Error in the deleteMyAnimeListItem service');
    throw new customError(`Error response from MyAnimeList: ${err.message || err.error}`, err.status, err.error || err);
  }
}

export const getUserAnimeList = async (user_id, status, sort, limit, offset, fields) => {
  try {
    // Get access token from MyAnimeList
    const access_token = await getMALConnection(user_id);
    if (!access_token) {
      throw new customError('Account not connected to MyAnimeList', 403);
    }

    // Send request to MyAnimeList
    const url = `https://api.myanimelist.net/v2/users/@me/animelist`;
    const params = new URLSearchParams({ 
      ...(status && { status }),
      ...(sort && { sort }),
      ...(limit && { limit }),
      ...(offset && { offset }),
      ...(fields && { fields }),
    });
    const response = await fetch(`${url}?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${access_token}`
      }
    });
    const data = await response.json();
    if (!response.ok) {
      throw {
        status: response.status,
        ...(data.message && { message: data.message }),
        ...(data.error && { error: data.error })
      }
    };

    // If limit and offset exist, send next page link
    if (data.paging.next) {
      const queryParams = data.paging.next.split("?")[1];
      data.paging.next = `${process.env.BASE_URL}/api/v1/mal/anime?${queryParams}`;
    }
    return data;
  } catch(err) {
    console.log('Error in the getUserAnimeList service');
    throw new customError(`Error response from MyAnimeList: ${err.message || err.error}`, err.status, err.error || err);
  }
}

export const getMyUserInformation = async (user_id) => {
  try {
    // Get access token from MyAnimeList
    const access_token = await getMALConnection(user_id);
    if (!access_token) {
      throw new customError('Account not connected to MyAnimeList', 403);
    }

    // Send request to MyAnimeList
    const data = await getMALProfile(access_token)
    return data;
  } catch(err) {
    console.log('Error in the getMyUserInformation service');
    throw new customError(`${err.message || err.error}`, err.status, err.error || err);
  }
}