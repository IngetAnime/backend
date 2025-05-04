import e from "express";
import * as controllers from '../controller/animeList.controller.js';
import * as validators from '../middlewares/validators/animeList.validator.js';
import { authMiddleware, authHandler } from "../middlewares/authHandler.js";

const router = e.Router();

router.post(
  '/:animeId/my-list-status', 
  authMiddleware, authHandler, 
  validators.animeId,
  controllers.createAnimeList
);
router.get(
  '/:animeId/my-list-status', 
  authMiddleware, authHandler,
  validators.animeId, 
  controllers.getAnimeListDetail
);
router.put(
  '/:animeId/my-list-status',
  authMiddleware, authHandler,
  validators.animeId, validators.updateAnimeList,
  controllers.updateAnimeList
);
router.patch(
  '/:animeId/my-list-status',
  authMiddleware, authHandler,
  validators.animeId, validators.createAnimeList,
  controllers.createOrUpdateAnimeList
);
router.delete(
  '/:animeId/my-list-status',
  authMiddleware, authHandler,
  validators.animeId,
  controllers.deleteAnimeList
);

export default router;