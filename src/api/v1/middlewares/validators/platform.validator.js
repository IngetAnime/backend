import { z } from "zod";
import { 
  idQ, link, oneAccessType, q, validate, num_watched_episodes, dateTime,
  booleanB,
  idB, 
} from './index.validator.js';

// Basic Platform 

export const platformId = validate(
  z.object({
    platformId: idQ,
  })
, 'params');

export const animeId = validate(
  z.object({
    animeId: idQ,
  })
, 'params');

export const name = validate(
  z.object({
    name: q,
  })
, 'body');

// Anime Platform

export const createAnimePlatform = validate(
  z.object({
    link: link, 
    accessType: oneAccessType, 
    nextEpisodeAiringAt: dateTime.nullable().optional(),
    lastEpisodeAiredAt: dateTime.nullable().optional(), 
    intervalInDays: idB.optional(), 
    episodeAired: num_watched_episodes.optional(), 
    isMainPlatform: booleanB.optional(),
  })
, 'body');

export const updateAnimePlatform = validate(
  z.object({
    link: link, 
    accessType: oneAccessType, 
    nextEpisodeAiringAt: dateTime.nullable(), 
    lastEpisodeAiredAt: dateTime.nullable(), 
    intervalInDays: idB, 
    episodeAired: num_watched_episodes, 
    isMainPlatform: booleanB,
  })
, 'body');

export const createOrUpdateAnimePlatform = validate(
  z.object({
    link: link.optional(), 
    accessType: oneAccessType.optional(), 
    nextEpisodeAiringAt: dateTime.nullable().optional(), 
    lastEpisodeAiredAt: dateTime.nullable().optional(), 
    intervalInDays: idB.optional(), 
    episodeAired: num_watched_episodes.optional(), 
    isMainPlatform: booleanB.optional(),
    isHiatus: booleanB.optional(),
  })
, 'body');