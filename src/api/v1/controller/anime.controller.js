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
      title, releaseAtStart, releaseAtEnd, episodeTotalMinimum, episodeTotalMaximum, status
    );
    res.status(200).json({ ...data });
  } catch(err) {
    console.log("Error in the getAllAnime controller");
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