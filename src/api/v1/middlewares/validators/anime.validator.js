import { optional, z } from "zod";
import { 
  validate, num_watched_episodes, q, link, dateTime, oneAnimeStatus, id, manyAnimeStatus, score, date, status, booleanB, 
  manyStatus,
  booleanQ,
  sortOrder,
  sortByAnimeList,
  sortByAnime,
  timeZone
} from './index.validator.js';

export const createAnime = validate(
  z.object({
    malId: num_watched_episodes,
    picture: link.optional(),
    title: q.optional(),
    titleEN: q.optional(),
    titleID: q.optional(),
    releaseAt: dateTime.optional(),
    episodeTotal: num_watched_episodes.optional(),
    status: oneAnimeStatus.optional()
  })
, 'body');

export const animeId = validate(
  z.object({
    animeId: id
  })
, 'params');

export const malId = validate(
  z.object({
    malId: id
  })
, 'query');

export const updateAnime = validate(
  z.object({
    picture: link.optional(),
    title: q.optional(),
    titleID: q.optional(),
    titleEN: q.optional(),
    releaseAt: dateTime.optional(),
    episodeTotal: num_watched_episodes.optional(),
    status: oneAnimeStatus.optional(),
    platformId: num_watched_episodes.optional()
  })
, 'body');

export const getAllAnime = validate(
  z.object({
    title: q.optional(),
    releaseAtStart: dateTime.optional(),
    releaseAtEnd: dateTime.optional(),
    episodeTotalMinimum: id.optional(),
    episodeTotalMaximum: id.optional(),
    status: manyAnimeStatus.optional(),
    sortBy: sortByAnime.optional(),
    sortOrder: sortOrder.optional()
  })
, 'query')

export const getAnimeTimeline = validate(
  z.object({
    weekCount: id.optional(),
    timeZone: timeZone.optional(),
  })
, 'query')

export const createOrUpdateAnimeList = validate(
  z.object({
    platformId: num_watched_episodes.optional(),
    episodesDifference: num_watched_episodes.optional(), 
    progress: num_watched_episodes.optional(), 
    score: score.optional(), 
    startDate: date.optional(), 
    finishDate: date.optional(), 
    status: status.optional(), 
    isSyncedWithMal: booleanB.optional()
  })
, 'body')

export const getAllAnimeList = validate(
  z.object({
    episodesDifferenceMinimum: id.optional(),
    episodesDifferenceMaximum: id.optional(),
    status: manyStatus.optional(),
    isSyncedWithMal: booleanQ.optional(),
    sortBy: sortByAnimeList.optional(),
    sortOrder: sortOrder.optional()
  })
, 'query')