import { z } from "zod";
import { validate, num_watched_episodes, q, link, dateTime, oneAnimeStatus, id, manyAnimeStatus } from './index.validator.js';

export const createAnime = validate(
  z.object({
    malId: num_watched_episodes,
    title: q.optional(),
    picture: link.optional(),
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
    title: q.optional(),
    picture: link.optional(),
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
    status: manyAnimeStatus.optional()
  })
, 'query')