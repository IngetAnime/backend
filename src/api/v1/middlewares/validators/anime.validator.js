import { optional, z } from "zod";
import { 
  validate, num_watched_episodes, q, link, dateTime, oneAnimeStatus, id, manyAnimeStatus,
  sortOrder,
  sortByAnime,
  timeZone,
  idB
} from './index.validator.js';

// Basic CRUD Anime

export const createAnime = validate(
  z.object({
    malId: idB,
    picture: link.optional(),
    title: q.optional(),
    titleEN: q.nullable().optional(),
    titleID: q.nullable().optional(),
    releaseAt: dateTime.nullable().optional(),
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
    picture: link,
    title: q,
    titleID: q.nullable(),
    titleEN: q.nullable(),
    releaseAt: dateTime.nullable(),
    episodeTotal: num_watched_episodes,
    status: oneAnimeStatus,
  })
, 'body');

export const updateAnimeFields = validate(
  z.object({
    picture: link.optional(),
    title: q.optional(),
    titleEN: q.nullable().optional(),
    titleID: q.nullable().optional(),
    releaseAt: dateTime.nullable().optional(),
    episodeTotal: num_watched_episodes.optional(),
    status: oneAnimeStatus.optional()
  })
, 'body');

// Anime Get

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