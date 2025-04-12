import e from "express";
import * as controllers from '../controller/anime.controller.js';
import * as validators from '../middlewares/validators/anime.validator.js';
import { authMiddleware, authHandler, adminHandler } from "../middlewares/authHandler.js";

const router = e.Router()

router.post('/', authMiddleware, authHandler, adminHandler, validators.createAnime, controllers.createAnime);
router.get('/:animeId', validators.animeId, controllers.getAnimeDetailByAnimeId);
router.patch(
  '/:animeId', 
  authMiddleware, authHandler, adminHandler,
  validators.animeId, validators.updateAnime,
  controllers.updateAnimeByAnimeId
)
router.delete(
  '/:animeId', 
  authMiddleware, authHandler, adminHandler, 
  validators.animeId, 
  controllers.deleteAnimeByAnimeId
)
router.get('/', validators.getAllAnime, controllers.getAllAnime);

export default router;