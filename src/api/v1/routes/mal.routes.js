import e from "express";
import * as controllers from '../controller/mal.controller.js';
import * as validators from '../middlewares/validators/mal.validator.js';
import { authMiddleware, authHandler, optAuthMiddleware } from "../middlewares/authHandler.js";

const router = e.Router();

router.get('/ranking', optAuthMiddleware, validators.getAnimeRanking, controllers.getAnimeRanking);
router.get(
  '/season/:year/:season', 
  optAuthMiddleware, 
  validators.getSeasonalAnimeP, 
  validators.getSeasonalAnimeQ,
  controllers.getSeasonalAnime
)
router.get(
  '/suggestions', 
  authMiddleware,
  authHandler,
  validators.getSuggestedAnime,
  controllers.getSuggestedAnime
)
router.get(
  '/mal/:anime_id(\\d+)', 
  optAuthMiddleware,
  validators.getAnimeDetailsP,
  validators.getAnimeDetailsQ,
  controllers.getAnimeDetails
)
router.get('/', optAuthMiddleware, validators.getAnimeList, controllers.getAnimeList)

export default router;