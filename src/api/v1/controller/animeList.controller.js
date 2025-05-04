import * as services from "../services/animeList.service.js"

export const createAnimeList = async (req, res, next) => {
  try {
    const userId = parseInt(req.user.id)
    const animeId = parseInt(req.params.animeId);
    const { 
      animePlatformId, startDate, finishDate, progress, score, episodesDifference, status, isSyncedWithMal
    } = req.body;
    const data = await services.createAnimeList(
      userId, animeId, animePlatformId, startDate, finishDate, progress, score, episodesDifference, status, isSyncedWithMal
    );
    res.status(201).json(data);
  } catch(err) {
    console.log("Error in the createAnimeList controller");
    next(err);
  }
}

export const getAnimeListDetail = async (req, res, next) => {
  try {
    const userId = parseInt(req.user.id)
    const animeId = parseInt(req.params.animeId);
    const data = await services.getAnimeListDetail(userId, animeId);
    res.status(200).json(data);
  } catch(err) {
    console.log("Error in the getAnimeListDetail controller");
    next(err);
  }
}

export const updateAnimeList = async (req, res, next) => {
  try {
    const userId = parseInt(req.user.id)
    const animeId = parseInt(req.params.animeId);
    const { 
      animePlatformId, startDate, finishDate, progress, score, episodesDifference, status, isSyncedWithMal
    } = req.body;
    const data = await services.updateAnimeList(
      userId, animeId, animePlatformId, startDate, finishDate, progress, score, episodesDifference, status, isSyncedWithMal
    );
    res.status(200).json(data);
  } catch(err) {
    console.log("Error in the updateAnimeList controller");
    next(err);
  }
}

export const createOrUpdateAnimeList = async (req, res, next) => {
  try {
    const userId = parseInt(req.user.id)
    const animeId = parseInt(req.params.animeId);
    const { 
      animePlatformId, startDate, finishDate, progress, score, episodesDifference, status, isSyncedWithMal
    } = req.body;
    const { statusCode, data } = await services.createOrUpdateAnimeList(
      userId, animeId, animePlatformId, startDate, finishDate, progress, score, episodesDifference, status, isSyncedWithMal
    );
    res.status(statusCode).json(data);
  } catch(err) {
    console.log("Error in the createOrUpdateAnimeList controller");
    next(err);
  }
}

export const deleteAnimeList = async (req, res, next) => {
  try {
    const userId = parseInt(req.user.id)
    const animeId = parseInt(req.params.animeId);
    const data = await services.deleteAnimeList(userId, animeId);
    res.status(200).json(data);
  } catch(err) {
    console.log("Error in the deleteAnimeList controller");
    next(err);
  }
}