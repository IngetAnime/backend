import { z } from "zod";
import { 
  id, link, oneAccessType, q, validate, num_watched_episodes, manyAccessType, dateTime, sortByPlatform, sortOrder 
} from './index.validator.js';

export const createPlatform = validate(
  z.object({
    animeId: num_watched_episodes, 
    name: q, 
    link: link, 
    accessType: oneAccessType, 
    releaseAt: dateTime, 
    icon: link.optional(), 
    episodesAired: num_watched_episodes.optional()
  })
, 'body');

export const getPlatformDetail = validate(
  z.object({
    platformId: id
  })
, 'params');

export const updatePlatrom = validate(
  z.object({
    name: q.optional(), 
    link: link.optional(), 
    accessType: oneAccessType.optional(), 
    releaseAt: dateTime.optional(), 
    icon: link.optional(), 
    episodesAired: num_watched_episodes.optional()
  })
, 'body');

export const getAllPlatforms = validate(
  z.object({
    animeId: id.optional(),
    name: q.optional(), 
    accessType: manyAccessType.optional(), 
    episodesAired: id.optional(),
    releaseAtStart: dateTime.optional(), 
    releaseAtStart: dateTime.optional(), 
    sortBy: sortByPlatform.optional(),
    sortOrder: sortOrder.optional()
  })
, 'query');