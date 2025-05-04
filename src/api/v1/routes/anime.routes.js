import e from "express";
import * as controllers from '../controller/anime.controller.js';
import * as validators from '../middlewares/validators/anime.validator.js';
import { authMiddleware, authHandler, adminHandler, optAuthMiddleware } from "../middlewares/authHandler.js";

const router = e.Router()

router.post('/', authMiddleware, authHandler, adminHandler, validators.createAnime, controllers.createAnime);
// router.get('/timeline', optAuthMiddleware, validators.getAnimeTimeline, controllers.getAnimeTimeline);
router.get('/:animeId', validators.animeId, controllers.getAnimeDetail);
router.put(
  '/:animeId', 
  authMiddleware, authHandler, adminHandler,
  validators.animeId, validators.updateAnime,
  controllers.updateAnime
)
router.patch(
  '/:animeId', 
  authMiddleware, authHandler, adminHandler,
  validators.animeId, validators.updateAnimeFields,
  controllers.updateAnimeFields
)
router.delete(
  '/:animeId', 
  authMiddleware, authHandler, adminHandler, 
  validators.animeId, 
  controllers.deleteAnime
)
// router.get('/', validators.getAllAnime, controllers.getAllAnime);

export default router;