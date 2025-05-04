import e from "express";
import * as controllers from '../controller/anime.controller.js';
import * as validators from '../middlewares/validators/anime.validator.js';
import { authMiddleware, authHandler, adminHandler, optAuthMiddleware } from "../middlewares/authHandler.js";

const router = e.Router()

router.post('/', authMiddleware, authHandler, adminHandler, validators.createAnime, controllers.createAnime);
// router.get('/my-list-status', authMiddleware, authHandler, validators.getAllAnimeList, controllers.getAllAnimeList);
router.get('/timeline', optAuthMiddleware, validators.getAnimeTimeline, controllers.getAnimeTimeline);
// router.get('/:animeId/my-list-status', authMiddleware, authHandler, validators.animeId, controllers.getAnimeListDetail);
router.get('/:animeId', validators.animeId, controllers.getAnimeDetailByAnimeId);
// router.patch(
//   '/:animeId/my-list-status', 
//   authMiddleware, authHandler, 
//   validators.animeId, validators.createOrUpdateAnimeList,
//   controllers.createOrUpdateAnimeList
// )
router.patch(
  '/:animeId', 
  authMiddleware, authHandler, adminHandler,
  validators.animeId, validators.updateAnime,
  controllers.updateAnimeByAnimeId
)
// router.delete(
//   '/:animeId/my-list-status', 
//   authMiddleware, authHandler, 
//   validators.animeId, 
//   controllers.deleteAnimeList
// )
router.delete(
  '/:animeId', 
  authMiddleware, authHandler, adminHandler, 
  validators.animeId, 
  controllers.deleteAnimeByAnimeId
)
router.get('/', validators.getAllAnime, controllers.getAllAnime);

export default router;