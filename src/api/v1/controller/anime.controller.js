import * as services from '../services/anime.service.js';

// Basic CRUD Anime

export const createAnime = async (req, res, next) => {
  try {
    const { malId, picture, title, titleID, titleEN, releaseAt, episodeTotal, status } = req.body;
    const data = await services.createAnime(malId, picture, title, titleID, titleEN, releaseAt, episodeTotal, status);
    res.status(201).json(data);
  } catch(err) {
    console.log("Error in the createAnime controller");
    next(err);
  }
}

export const getAnimeDetail = async (req, res, next) => {
  try {
    const animeId = parseInt(req.params.animeId);
    const data = await services.getAnimeDetail(animeId);
    res.status(200).json(data);
  } catch(err) {
    console.log("Error in the getAnimeDetail controller");
    next(err);
  }
}

export const updateAnime = async (req, res, next) => {
  try {
    const animeId = parseInt(req.params.animeId);
    const { picture, title, titleID, titleEN, releaseAt, episodeTotal, status, platformId } = req.body;
    const data = await services.updateAnime(
      animeId, undefined, picture, title, titleID, titleEN, releaseAt, episodeTotal, status, platformId
    );
    res.status(200).json(data);
  } catch(err) {
    console.log("Error in the updateAnime controller");
    next(err);
  }
}

export const updateAnimeFields = async (req, res, next) => {
  try {
    const animeId = parseInt(req.params.animeId);
    const { picture, title, titleID, titleEN, releaseAt, episodeTotal, status } = req.body;
    const data = await services.updateAnimeFields(
      animeId, undefined, picture, title, titleID, titleEN, releaseAt, episodeTotal, status
    );
    res.status(200).json(data);
  } catch(err) {
    console.log("Error in the updateAnimeFields controller");
    next(err);
  }
}

export const deleteAnime = async (req, res, next) => {
  try {
    const animeId = parseInt(req.params.animeId);
    const data = await services.deleteAnime(animeId);
    res.status(200).json(data);
  } catch(err) {
    console.log("Error in the deleteAnime controller");
    next(err);
  }
}

// Anime Get

export const getAnimeTimeline = async (req, res, next) => {
  try {
    const userId = req.user ? req.user.id : undefined;
    const { weekCount, timeZone, myListOnly, originalSchedule } = req.query;
    const data = await services.getAnimeTimeline(userId, weekCount, timeZone, JSON.parse(myListOnly), JSON.parse(originalSchedule));
    res.status(200).json(data);
  } catch(err) {
    console.log("Error in the getAnimeTimeline controller");
    next(err);
  }
}

export const getAllAnime = async (req, res, next) => {
  try {
    const { title, releaseAtStart, releaseAtEnd, episodeTotalMinimum, episodeTotalMaximum, status } = req.query;
    const data = await services.getAllAnime(
      title, releaseAtStart, releaseAtEnd, parseInt(episodeTotalMinimum), parseInt(episodeTotalMaximum), status
    );
    res.status(200).json({ ...data });
  } catch(err) {
    console.log("Error in the getAllAnime controller");
    next(err);
  }
}