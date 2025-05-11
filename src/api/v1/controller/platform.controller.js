import * as services from '../services/platform.service.js';

// Basic Platform

export const createPlatform = async (req, res, next) => {
  try {
    const { name } = req.body;
    const data = await services.createPlatform(name);
    res.status(201).json(data);
  } catch(err) {
    console.log("Error in the createPlatform controller");
    next(err);
  }
}

export const getPlatformDetail = async (req, res, next) => {
  try {
    const platformId = parseInt(req.params.platformId);
    const data = await services.getPlatformDetail(platformId);
    res.status(200).json(data);
  } catch(err) {
    console.log("Error in the getPlatformDetail controller");
    next(err);
  }
}

export const updatePlatform = async (req, res, next) => {
  try {
    const platformId = parseInt(req.params.platformId);
    const { name } = req.body;
    const data = await services.updatePlatform(platformId, name);
    res.status(200).json(data);
  } catch(err) {
    console.log("Error in the updatePlatform controller");
    next(err);
  }
}

export const deletePlatform = async (req, res, next) => {
  try {
    const platformId = parseInt(req.params.platformId);
    const data = await services.deletePlatform(platformId);
    res.status(200).json(data);
  } catch(err) {
    console.log("Error in the deletePlatform controller");
    next(err);
  }
}

export const getPlatforms = async (req, res, next) => {
  try {
    const data = await services.getPlatforms();
    res.status(200).json(data);
  } catch(err) {
    console.log("Error in the getPlatforms controller");
    next(err);
  }
}

// Anime Platform

export const createAnimePlatform = async (req, res, next) => {
  try {
    const animeId = parseInt(req.params.animeId);
    const platformId = parseInt(req.params.platformId);
    const { 
      link, accessType, nextEpisodeAiringAt, 
      lastEpisodeAiredAt, intervalInDays, episodeAired, isMainPlatform 
    } = req.body;
    const data = await services.createAnimePlatform(
      animeId, platformId, link, accessType, nextEpisodeAiringAt, 
      lastEpisodeAiredAt, intervalInDays, episodeAired, isMainPlatform
    );
    res.status(201).json(data);
  } catch(err) {
    console.log("Error in the createAnimePlatform controller");
    next(err);
  }
}

export const getAnimePlatformDetail = async (req, res, next) => {
  try {
    const animeId = parseInt(req.params.animeId);
    const platformId = parseInt(req.params.platformId);
    const data = await services.getAnimePlatformDetail(animeId, platformId);
    res.status(200).json(data);
  } catch(err) {
    console.log("Error in the getAnimePlatformDetail controller");
    next(err);
  }
}

export const updateAnimePlatform = async (req, res, next) => {
  try {
    const animeId = parseInt(req.params.animeId);
    const platformId = parseInt(req.params.platformId);
    const { 
      link, accessType, nextEpisodeAiringAt, 
      lastEpisodeAiredAt, intervalInDays, episodeAired, isMainPlatform 
    } = req.body;
    const data = await services.updateAnimePlatform(
      animeId, platformId, link, accessType, nextEpisodeAiringAt, 
      lastEpisodeAiredAt, intervalInDays, episodeAired, isMainPlatform
    );
    res.status(200).json(data);
  } catch(err) {
    console.log("Error in the updateAnimePlatform controller");
    next(err);
  }
}

export const createOrUpdateAnimePlatform = async (req, res, next) => {
  try {
    const animeId = parseInt(req.params.animeId);
    const platformId = parseInt(req.params.platformId);
    const { 
      link, accessType, nextEpisodeAiringAt, 
      lastEpisodeAiredAt, intervalInDays, episodeAired, isMainPlatform, isHiatus
    } = req.body;
    const { statusCode, data } = await services.createOrUpdateAnimePlatform(
      animeId, platformId, link, accessType, nextEpisodeAiringAt, 
      lastEpisodeAiredAt, intervalInDays, episodeAired, isMainPlatform, isHiatus
    );
    res.status(statusCode).json(data);
  } catch(err) {
    console.log("Error in the createOrUpdateAnimePlatform controller");
    next(err);
  }
}

export const deleteAnimePlatform = async (req, res, next) => {
  try {
    const animeId = parseInt(req.params.animeId);
    const platformId = parseInt(req.params.platformId);
    const data = await services.deleteAnimePlatform(animeId, platformId);
    res.status(200).json(data);
  } catch(err) {
    console.log("Error in the deleteAnimePlatform controller");
    next(err);
  }
}

export const getAnimePlatforms = async (req, res, next) => {
  try {
    const animeId = parseInt(req.params.animeId);
    const data = await services.getAnimePlatforms(animeId);
    res.status(200).json(data);
  } catch(err) {
    console.log("Error in the getAnimePlatforms controller");
    next(err);
  }
}