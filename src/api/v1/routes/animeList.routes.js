import e from "express";
import * as controllers from '../controller/animeList.controller.js';
import * as validators from '../middlewares/validators/animeList.validator.js';
import { authMiddleware, authHandler } from "../middlewares/authHandler.js";

const router = e.Router();

router.post(
  '/:animeId(\\d+)/my-list-status', 
  authMiddleware, authHandler, 
  validators.animeId,
  controllers.createAnimeList
);
router.get(
  '/:animeId(\\d+)/my-list-status', 
  authMiddleware, authHandler,
  validators.animeId, 
  controllers.getAnimeListDetail
);
router.put(
  '/:animeId(\\d+)/my-list-status',
  authMiddleware, authHandler,
  validators.animeId, validators.updateAnimeList,
  controllers.updateAnimeList
);
router.patch(
  '/:animeId(\\d+)/my-list-status',
  authMiddleware, authHandler,
  validators.animeId, validators.createAnimeList,
  controllers.createOrUpdateAnimeList
);
router.delete(
  '/:animeId(\\d+)/my-list-status',
  authMiddleware, authHandler,
  validators.animeId,
  controllers.deleteAnimeList
);

export default router;