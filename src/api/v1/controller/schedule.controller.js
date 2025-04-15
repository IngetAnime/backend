import * as services from '../services/schedule.service.js';

// Platform 

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

export const getPlatformScheduleById = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const data = await services.getPlatformScheduleById(id);
    res.status(200).json({ ...data });
  } catch(err) {
    console.log("Error in the getPlatformScheduleById controller");
    next(err);
  }
}

export const deletePlatformScheduleById = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const data = await services.deletePlatformScheduleById(id);
    res.status(200).json({ ...data });
  } catch(err) {
    console.log("Error in the deletePlatformScheduleById controller");
    next(err);
  }
}

// Anime

export const createOrUpdateAnimeSchedule = async (req, res, next) => {
  try {
    const animeId = parseInt(req.params.animeId);
    const { status, updateOn } = req.body
    const { statusCode, ...data } = await services.createOrUpdateAnimeSchedule(animeId, status, updateOn);
    res.status(statusCode).json({ ...data });
  } catch(err) {
    console.log("Error in the createOrUpdateAnimeSchedule controller");
    next(err);
  }
}

export const getAnimeSchedule = async (req, res, next) => {
  try {
    const animeId = parseInt(req.params.animeId);
    const data = await services.getAnimeSchedule(animeId);
    res.status(200).json({ ...data });
  } catch(err) {
    console.log("Error in the getAnimeSchedule controller");
    next(err);
  }
}

export const getAnimeScheduleById = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const data = await services.getAnimeScheduleById(id);
    res.status(200).json({ ...data });
  } catch(err) {
    console.log("Error in the getAnimeScheduleById controller");
    next(err);
  }
}

export const deleteAnimeScheduleById = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const data = await services.deleteAnimeScheduleById(id);
    res.status(200).json({ ...data });
  } catch(err) {
    console.log("Error in the deleteAnimeScheduleById controller");
    next(err);
  }
}