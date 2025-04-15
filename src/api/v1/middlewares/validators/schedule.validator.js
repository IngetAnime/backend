import { optional, z } from "zod";
import { num_watched_episodes, dateTime, id, validate, oneAnimeStatus } from "./index.validator.js";

export const createOrUpdatePlatformSchedule = validate(
  z.object({
    episodeNumber: num_watched_episodes, 
    updateOn: dateTime
  })
, 'body')

export const createOrUpdateAnimeSchedule = validate(
  z.object({
    status: oneAnimeStatus, 
    updateOn: dateTime
  })
, 'body')

export const platformId = validate(
  z.object({
    platformId: id
  })
, 'params');

export const animeId = validate(
  z.object({
    animeId: id
  })
, 'params');

export const scheduleId = validate(
  z.object({
    id: id
  })
, 'params');