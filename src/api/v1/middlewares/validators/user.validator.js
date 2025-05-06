import { z } from "zod";
import { 
  validate,
  manyStatus,
  type,
  booleanB,
  sortAnimeList,
} from './index.validator.js';

export const getAnimeList = validate(
  z.object({
    status: manyStatus.optional(),
    sort: sortAnimeList.optional()
  })
, 'query');

export const importAnimeList = validate(
  z.object({
    isSyncedWithMAL: booleanB.optional(),
    type: type
  })
, 'body');