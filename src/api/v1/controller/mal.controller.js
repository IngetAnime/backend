import * as services from '../services/mal.service.js'

export const getAnimeList = async (req, res, next) => {
  try {
    const user_id = req.user ? req.user.id : undefined;
    const { q, limit, offset, fields } = req.query;
    const data = await services.getAnimeList(user_id, q, limit, offset, fields);
    res.status(200).json({ ...data });
  } catch(err) {
    console.log("Error in the getAnimeList controller");
    next(err);
  }
}

export const getAnimeDetails = async (req, res, next) => {
  try {
    const user_id = req.user ? req.user.id : undefined;
    const { anime_id } = req.params;
    const { fields } = req.query;
    const data = await services.getAnimeDetails(user_id, anime_id, fields);
    res.status(200).json({ ...data });
  } catch(err) {
    console.log("Error in the getAnimeDetails controller");
    next(err);
  }
}

export const getAnimeRanking = async (req, res, next) => {
  try {
    const user_id = req.user ? req.user.id : undefined;
    const { ranking_type, limit, offset, fields } = req.query;
    const data = await services.getAnimeRanking(user_id, ranking_type, limit, offset, fields);
    res.status(200).json({ ...data });
  } catch(err) {
    console.log("Error in the getAnimeRanking controller");
    next(err);
  }
}

export const getSeasonalAnime = async (req, res, next) => {
  try {
    const user_id = req.user ? req.user.id : undefined;
    const { year, season } = req.params;
    const { sort, limit, offset, fields } = req.query;
    const data = await services.getSeasonalAnime(user_id, year, season, sort, limit, offset, fields);
    res.status(200).json({ ...data });
  } catch(err) {
    console.log("Error in the getSeasonalAnime controller");
    next(err);
  }
}

// User have to connect with MyAnimeList account

export const getSuggestedAnime = async (req, res, next) => {
  try {
    const { id } = req.user;
    const { limit, offset, fields } = req.query;
    const data = await services.getSuggestedAnime(id, limit, offset, fields);
    res.status(200).json({ ...data });
  } catch(err) {
    console.log("Error in the getSuggestedAnime controller");
    next(err);
  }
}