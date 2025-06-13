import { z } from "zod";
import { 
  validate,
  manyStatus,
  type,
  booleanB,
  sortAnimeList,
  email,
  username,
} from './index.validator.js';

export const getAnimeList = validate(
  z.object({
    status: manyStatus.optional(),
    sort: sortAnimeList.optional()
  })
, 'query');

export const importAnimeList = validate(
  z.object({
    isSyncedWithMal: booleanB.optional(),
    type: type
  })
, 'body');

export const checkEmail = validate(
  z.object({
    email
  })
, 'query');

export const checkUsername = validate(
  z.object({
    username
  })
, 'query');

export const updateUserDetail = validate(
  z.object({
    username: username.optional(), 
    email: email.optional()
  })
, 'body');