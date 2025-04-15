import * as services from '../services/anime.service.js';

export const createAnime = async (req, res, next) => {
  try {
    const { malId, title, picture, releaseAt, episodeTotal, status } = req.body;
    const data = await services.createAnime(malId, title, picture, releaseAt, episodeTotal, status);
    res.status(201).json({ ...data });
  } catch(err) {
    console.log("Error in the createAnime controller");
    next(err);
  }
}

export const getAnimeDetailByAnimeId = async (req, res, next) => {
  try {
    const animeId = parseInt(req.params.animeId);
    const data = await services.getAnimeDetailById(animeId);
    res.status(200).json({ ...data });
  } catch(err) {
    console.log("Error in the getAnimeDetailByAnimeId controller");
    next(err);
  }
}

export const updateAnimeByAnimeId = async (req, res, next) => {
  try {
    const animeId = parseInt(req.params.animeId);
    const { title, picture, releaseAt, episodeTotal, status, platformId } = req.body;
    const data = await services.updateAnime(animeId, undefined, title, picture, releaseAt, episodeTotal, status, platformId);
    res.status(200).json({ ...data });
  } catch(err) {
    console.log("Error in the updateAnimeByAnimeId controller");
    next(err);
  }
}

export const deleteAnimeByAnimeId = async (req, res, next) => {
  try {
    const animeId = parseInt(req.params.animeId);
    const data = await services.deleteAnime(animeId);
    res.status(200).json({ ...data });
  } catch(err) {
    console.log("Error in the deleteAnimeByAnimeId controller");
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

export const getAnimeTimeline = async (req, res, next) => {
  try {
    const userId = req.user ? req.user.id : undefined;
    const { weekCount, timeZone } = req.query;
    const data = await services.getAnimeTimeline(userId, weekCount, timeZone);
    res.status(200).json({ ...data });
  } catch(err) {
    console.log("Error in the getAnimeTimeline controller");
    next(err);
  }
}

export const createOrUpdateAnimeList = async (req, res, next) => {
  try {
    const userId = parseInt(req.user.id)
    const animeId = parseInt(req.params.animeId);
    const { platformId, episodesDifference, progress, score, startDate, finishDate, status, isSyncedWithMal } = req.body;
    const { statusCode, ...data} = await services.createOrUpdateAnimeList(
      userId, animeId, platformId, episodesDifference, progress, score, startDate, finishDate, status, isSyncedWithMal
    );
    res.status(statusCode).json({ ...data });
  } catch(err) {
    console.log("Error in the createOrUpdateAnimeList controller");
    next(err);
  }
}

export const getAnimeListDetail = async (req, res, next) => {
  try {
    const userId = parseInt(req.user.id)
    const animeId = parseInt(req.params.animeId);
    const data = await services.getAnimeListDetail(userId, animeId);
    res.status(200).json({ ...data });
  } catch(err) {
    console.log("Error in the getAnimeListDetail controller");
    next(err);
  }
}

export const deleteAnimeList = async (req, res, next) => {
  try {
    const userId = parseInt(req.user.id)
    const animeId = parseInt(req.params.animeId);
    const data = await services.deleteAnimeList(userId, animeId);
    res.status(200).json({ ...data });
  } catch(err) {
    console.log("Error in the deleteAnimeList controller");
    next(err);
  }
}

export const getAllAnimeList = async (req, res, next) => {
  try {
    const userId = parseInt(req.user.id)
    const { episodesDifferenceMinimum, episodesDifferenceMaximum, status, isSyncedWithMal, sortBy, sortOrder } = req.query;
    const data = await services.getAllAnimeList(
      userId, parseInt(episodesDifferenceMinimum), parseInt(episodesDifferenceMaximum), status, isSyncedWithMal, 
      sortBy, sortOrder
    );
    res.status(200).json({ ...data });
  } catch(err) {
    console.log("Error in the getAllAnimeList controller");
    next(err);
  }
}

// export const getAnimeDetailByMALId = async (req, res, next) => {
//   try {
//     const malId = parseInt(req.query.malId);
//     const data = await services.getAnimeDetailById(undefined, malId);
//     res.status(200).json({ ...data });
//   } catch(err) {
//     console.log("Error in the getAnimeDetailByMALId controller");
//     next(err);
//   }
// }


// export const updateAnimeByMALId = async (req, res, next) => {
//   try {
//     const malId = parseInt(req.query.malId);
//     const { title, picture, releaseAt, episodeTotal, status, platformId } = req.body;
//     const data = await services.updateAnime(undefined, malId, title, picture, releaseAt, episodeTotal, status, platformId);
//     res.status(200).json({ ...data });
//   } catch(err) {
//     console.log("Error in the updateAnimeByMALId controller");
//     next(err);
//   }
// }

// export const deleteAnimeByMALId = async (req, res, next) => {
//   try {
//     const malId = parseInt(req.query.malId);
//     const data = await services.deleteAnime(undefined, malId);
//     res.status(200).json({ ...data });
//   } catch(err) {
//     console.log("Error in the deleteAnimeByMALId controller");
//     next(err);
//   }
// }