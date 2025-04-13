import * as services from '../services/platform.service.js';

export const createPlatform = async (req, res, next) => {
  try {
    const { animeId, name, link, accessType, nextEpisodeAiringAt, lastEpisodeAiredAt, icon, episodeAired } = req.body;
    const data = await services.createPlatform(
      animeId, name, link, accessType, nextEpisodeAiringAt, lastEpisodeAiredAt, icon, episodeAired
    );
    res.status(201).json({ ...data });
  } catch(err) {
    console.log("Error in the createPlatform controller");
    next(err);
  }
}

export const getPlatformDetail = async (req, res, next) => {
  try {
    const platformId = parseInt(req.params.platformId);
    const data = await services.getPlatformDetail(platformId);
    res.status(200).json({ ...data });
  } catch(err) {
    console.log("Error in the getPlatformDetail controller");
    next(err);
  }
}

export const updatePlatrom = async (req, res, next) => {
  try {
    const platformId = parseInt(req.params.platformId);
    const { name, link, accessType, nextEpisodeAiringAt, lastEpisodeAiredAt, icon, episodeAired } = req.body;
    const data = await services.updatePlatrom(
      platformId, name, link, accessType, nextEpisodeAiringAt, lastEpisodeAiredAt, icon, episodeAired
    );
    res.status(200).json({ ...data });
  } catch(err) {
    console.log("Error in the updatePlatrom controller");
    next(err);
  }
}

export const deletePlatform = async (req, res, next) => {
  try {
    const platformId = parseInt(req.params.platformId);
    const data = await services.deletePlatform(platformId);
    res.status(200).json({ ...data });
  } catch(err) {
    console.log("Error in the deletePlatform controller");
    next(err);
  }
}

export const getAllPlatforms = async (req, res, next) => {
  try {
    const { 
      animeId, name, accessType, 
      nextEpisodeAiringAtMinimum, nextEpisodeAiringAtMaximum, lastEpisodeAiredAtMinimum, lastEpisodeAiredAtMaximum,
      episodeAiredMinimum, episodeAiredMaximum, sortBy, sortOrder
    } = req.query;
    const data = await services.getAllPlatforms(
      parseInt(animeId), name, accessType, 
      nextEpisodeAiringAtMinimum, nextEpisodeAiringAtMaximum, lastEpisodeAiredAtMinimum, lastEpisodeAiredAtMaximum,
      parseInt(episodeAiredMinimum), parseInt(episodeAiredMaximum), sortBy, sortOrder
    );
    res.status(200).json({ ...data });
  } catch(err) {
    console.log("Error in the getAllPlatforms controller");
    next(err);
  }
}

export const createOrUpdatePlatformSchedule = async (req, res, next) => {
  try {
    const platformId = parseInt(req.params.platformId);
    const { episodeNumber, updateOn } = req.body
    const { statusCode, ...data } = await services.createOrUpdatePlatformSchedule(platformId, episodeNumber, updateOn);
    res.status(statusCode).json({ ...data });
  } catch(err) {
    console.log("Error in the createOrUpdatePlatformSchedule controller");
    next(err);
  }
}

export const getPlatformSchedule = async (req, res, next) => {
  try {
    const platformId = parseInt(req.params.platformId);
    const data = await services.getPlatformSchedule(platformId);
    res.status(200).json({ ...data });
  } catch(err) {
    console.log("Error in the getPlatformSchedule controller");
    next(err);
  }
}