import { z } from "zod";
import { 
  validate, q, limit, offset, fields, id, ranking_type, sortAnime,
  year, season,
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
    anime_id: id,
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