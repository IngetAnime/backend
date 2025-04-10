import { z } from "zod";
import { 
  validate, q, limit, offset, fields, anime_id, ranking_type, sortAnime,
  year, season, status, score, num_watched_episodes, date, sortList
} from './index.validator.js';

export const getAnimeList = validate(
  z.object({
    q,
    limit: limit(1, 100).optional(),
    offset: offset.optional(),
    fields: fields.optional()
  })
, 'query');

export const getAnimeDetailsP = validate(
  z.object({
    anime_id,
  })
, 'params');

export const getAnimeDetailsQ = validate(
  z.object({
    fields: fields.optional()
  })
, 'query')

export const getAnimeRanking = validate(
  z.object({
    ranking_type,
    limit: limit(1, 500).optional(),
    offset: offset.optional(),
    fields: fields.optional()
  })
, 'query');

export const getSeasonalAnimeQ = validate(
  z.object({
    sort: sortAnime.optional(),
    limit: limit(1, 500).optional(),
    offset: offset.optional(),
    fields: fields.optional()
  })
, 'query')

export const getSeasonalAnimeP = validate(
  z.object({
    year,
    season
  })
, 'params')

export const getSuggestedAnime = validate(
  z.object({
    limit: limit(1, 100).optional(),
    offset: offset.optional(),
    fields: fields.optional()
  })
, 'query')

export const updateMyAnimeListStatus = validate(
  z.object({
    status: status.optional(),
    score: score.optional(),
    num_watched_episodes: num_watched_episodes.optional(),
    start_date: date.optional(),
    finish_date: date.optional(),
  })
, 'body')

export const getUserAnimeList = validate(
  z.object({
    status: status.optional(),
    sort: sortList.optional(),
    limit: limit(1, 1000).optional(),
    offset: offset.optional(),
    fields: fields.optional()
  })
, 'query')