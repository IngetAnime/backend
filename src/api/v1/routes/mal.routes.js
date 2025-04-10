import e from "express";
import * as controllers from '../controller/mal.controller.js';
import * as validators from '../middlewares/validators/mal.validator.js';
import { authMiddleware, authHandler, optAuthMiddleware } from "../middlewares/authHandler.js";

const router = e.Router();

router.get('/anime/ranking', optAuthMiddleware, validators.getAnimeRanking, controllers.getAnimeRanking);
router.get(
  '/anime/season/:year/:season', 
  optAuthMiddleware, 
  validators.getSeasonalAnimeP, 
  validators.getSeasonalAnimeQ,
  controllers.getSeasonalAnime
)
router.get(
  '/anime/suggestions', 
  authMiddleware,
  authHandler,
  validators.getSuggestedAnime,
  controllers.getSuggestedAnime
)
router.patch(
  '/anime/:anime_id/my_list_status',
  authMiddleware,
  authHandler,
  validators.getAnimeDetailsP,
  validators.updateMyAnimeListStatus,
  controllers.updateMyAnimeListStatus
)
router.delete(
  '/anime/:anime_id/my_list_status', 
  authMiddleware,
  authHandler,
  validators.getAnimeDetailsP,
  controllers.deleteMyAnimeListItem
)
router.get(
  '/anime/:anime_id', 
  optAuthMiddleware,
  validators.getAnimeDetailsP,
  validators.getAnimeDetailsQ,
  controllers.getAnimeDetails
)
router.get('/anime', optAuthMiddleware, validators.getAnimeList, controllers.getAnimeList)
router.get(
  '/users/@me/animelist', 
  authMiddleware,
  authHandler,
  validators.getUserAnimeList,
  controllers.getUserAnimeList
)
router.get('/users/@me', authMiddleware, authHandler, controllers.getMyUserInformation)

export default router;