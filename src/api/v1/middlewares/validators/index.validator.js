import { z } from "zod";
import customError from '../../utils/customError.js';

import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';

dayjs.extend(utc);
dayjs.extend(timezone);

// Authentication
export const email = z.string().email().nonempty()
export const password = z
  .string()
  .min(8, "Password must be at least 8 characters long")
  .max(64, "Password must not exceed 64 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one digit")
  .regex(/[@$!%*?&]/, "Password must contain at least one special character (@$!%*?&)")
export const confirmPassword = z.string().min(8, "Password must be at least 8 characters long")
export const username = z
  .string()
  .min(3, "Username must be at least 3 characters long")
  .max(20, "Username must not exceed 20 characters")
  .regex(/^(?!_)(?!.*__)[a-zA-Z0-9_]+(?<!_)$/, 
    "Username can only contain letters, numbers, and underscores, but cannot start or end with an underscore"
  )
export const identifier = z
  .string()
  .min(3, "Indentifier must be at least 3 characters long")
  .refine(
    (value) =>
      /^[a-zA-Z0-9_]+$/.test(value) || /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(value),
    {
      message: "Identifier must be a valid email or username",
    }
  )

// MyAnimeList
export const q = z
  .string().min(3)
export const limit = (min, max) => {
  return z
    .string()
    .transform((val) => Number(val))
    .refine((val) => Number.isInteger(val) && val >= min && val <= max, {
      message: `Limit is integer number between ${min} and ${max}`
    })
}
export const offset = z
  .string()
  .transform((val) => Number(val))
  .refine((val) => Number.isInteger(val) && val >= 0, {
    message: `Offset is integer number start from 0`
  })
export const fields = z
  .string()
  .regex(/^[^,\s]+(,[^,\s]+)*$/, {
    message: "Invalid format. Value must be seperated by comma without any space"
  })
export const id = z
  .string()
  .transform((val) => (val ? Number(val) : undefined))
  .refine((val) => (val === undefined || (Number.isInteger(val) && val >= 0)), "Positive integer number")
export const idQ = z
  .string()
  .transform((val) => (val ? Number(val) : undefined))
  .refine((val) => (val === undefined || (Number.isInteger(val) && val > 0)), "Positive integer number")
export const idB = z.number().int().positive()
export const ranking_type = z
  .enum(["all", "airing", "upcoming", "tv", "ova", "movie", "special", "bypopularity", "favorite"], {
    errorMap: () => ({ 
      message: "ranking_type must be one of: all, airing, upcoming, tv, ova, movie, special, bypopularity, or favorite"
    })
  })
export const sortAnime = z.enum(["anime_score", "anime_num_list_users"], {
    errorMap: () => ({ 
      message: "sort must be one of: anime_score or anime_num_list_users"
    })
  })
export const year = z
  .string()
  .transform((val) => Number(val))
  .refine((val) => Number.isInteger(val) && val >= 1917, {
    message: 'Year start from 1917'
  })
export const season = z
  .enum(["winter", "spring", "summer", "fall"], {
    errorMap: () => ({ 
      message: "season must be one of: winter, spring, summer, or fall"
    })
  })
export const status = z
  .enum(["watching", "completed", "plan_to_watch", "on_hold", "dropped"], {
    errorMap: () => ({ 
      message: "status must be one of: watching, completed, plan_to_watch, on_hold, or dropped"
    }),
  })
export const score = z.number().int().min(0).max(10)
export const num_watched_episodes = z.number().int().nonnegative()
export const date = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid format. Valid format: YYYY-MM-DD")
  .refine(
    (value) => !isNaN(Date.parse(value)),
    "Invalid date"
  )
export const sortList = z
  .enum(["list_score", "list_updated_at", "anime_title", "anime_start_date", "anime_id"], {
    errorMap: () => ({ 
      message: "sort must be one of: list_score, list_updated_at, anime_title, anime_start_date, or anime_id"
    })
  })

// Platform
export const link = z.string().url()
export const oneAccessType = z
  .enum(["limited_time", "subscription", "free"], {
    errorMap: () => ({ message: "accessType must be one of: limited_time, subscription, or free" })
  })
export const manyAccessType = z
  .string()
  .transform((val) => val?.split(",").map((s) => s.trim()))
  .refine(
    (values) => values.every((value) => ["limited_time", "subscription", "free"].includes(value)),
    {
      message: "accessType must be one of: limited_time, subscription, or free. If more than one, please seperate them by comma without any space",
    }
  )
export const sortByPlatform = z
  .enum(["nextEpisodeAiringAt", "lastEpisodeAiredAt", "name", "animeId", "episodeAired"], {
    errorMap: () => ({ message: "sortBy must be one of: nextEpisodeAiringAt, lastEpisodeAiredAt, name, animeId, or episodeAired" })
  })
export const sortOrder = z
  .enum(["asc", "desc"], {
    errorMap: () => ({ message: "sortOrder must be one of: asc or desc" })
  })
export const dateTime = z
  .string()
  .refine(
    (value) => !isNaN(Date.parse(value)),
    "Invalid datetime. Value must be ISO String format"
  )

// Anime
export const oneAnimeStatus = z
  .enum(["currently_airing", "finished_airing", "not_yet_aired"], {
    errorMap: () => ({ message: "status must be one of: currently_airing, finished_airing, or not_yet_aired" })
  })
export const manyAnimeStatus = z
  .string()
  .transform((val) => val?.split(",").map((s) => s.trim()))
  .refine(
    (values) => values.every((value) => ["currently_airing", "finished_airing", "not_yet_aired", "hiatus"].includes(value)),
    {
      message: "status must be one of: currently_airing, finished_airing, not_yet_aired or hiatus. If more than one, please seperate them by comma without any space",
    }
  )
export const booleanB = z.boolean()
export const booleanQ = z
  .enum(["true", "false"], {
    errorMap: () => ({ message: "boolean value, must be one of: true or false" })
  })
export const manyStatus = z
  .string()
  .transform((val) => val?.split(",").map((s) => s.trim()))
  .refine(
    (values) => values.every((value) => ["watching", "completed", "plan_to_watch", "on_hold", "dropped"].includes(value)),
    {
      message: "status must be one of: watching, completed, plan_to_watch, on_hold, or dropped. If more than one, please seperate them by comma without any space",
    }
  )
export const sortByAnime = z
  .enum(["title", "releaseAt", "updatedAt", "episodeTotal", "malId"], {
    errorMap: () => ({ message: "sortBy must be one of: title, releaseAt, updatedAt, episodeTotal, or malId" })
  })
export const sortByAnimeList = z
  .enum(["title", "releaseAt", "updatedAt", "score", "progress"], {
    errorMap: () => ({ message: "sortBy must be one of: title, releaseAt, updatedAt, score, or progress" })
  })
export const timeZone = z
  .string()
  .min(1, 'Invalid time zone')
  .refine(
    timeZone => {
      try {
        return dayjs().tz(timeZone).isValid();
      } catch(err) {
        return false;
      }
    }, 
    { message: "Invalid time zone", }
  )
  
// User
export const type = z
  .enum(["skip_duplicates", "overwrite_all", "latest_updated"], {
    errorMap: () => ({ message: "sortBy must be one of: skip_duplicates, overwrite_all, or latest_updated" })
  })

export const sortAnimeList = z
  .enum(["list_score", "list_updated_at", "anime_title", "anime_start_date"], {
    errorMap: () => ({ message: "sortBy must be one of: list_score, list_updated_at, anime_title, or anime_start_date" })
  })

  
export const validate = (schema, payload) => (req, res, next) => {
  try {
    switch (payload) {
      case 'body':
        schema.parse(req.body);
        break;
      case 'params':
        schema.parse(req.params);
        break;
      case 'query':
        schema.parse(req.query);
        break;
      default:
        schema.parse(req.body);
        break;
    }
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      // const fieldErrors = error.errors.map((issue) => ({
      //   field: issue.path.join("."),
      //   message: issue.message,
      // }));
      next(new customError('Invalid input data', 400, error))
    }
    next(error);
  }  
};