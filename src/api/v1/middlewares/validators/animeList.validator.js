import { z } from "zod";
import { 
  validate, num_watched_episodes, score, date, status, booleanB, 
  idQ,
  idB
} from './index.validator.js';

export const animeId = validate(
  z.object({
    animeId: idQ
  })
, 'params')

export const createAnimeList = validate(
  z.object({
    animePlatformId: idB.nullable().optional(), 
    startDate: date.nullable().optional(), 
    finishDate: date.nullable().optional(), 
    progress: num_watched_episodes.optional(), 
    score: score.optional(), 
    episodesDifference: num_watched_episodes.optional(), 
    status: status.optional(), 
    isSyncedWithMal: booleanB.optional()
  })
, 'body')

export const updateAnimeList = validate(
  z.object({
    animePlatformId: idB.nullable(), 
    startDate: date.nullable(), 
    finishDate: date.nullable(), 
    progress: num_watched_episodes, 
    score: score, 
    episodesDifference: num_watched_episodes, 
    status: status, 
    isSyncedWithMal: booleanB
  })
, 'body')