import e from "express";
import * as controllers from '../controller/platform.controller.js';
import * as validators from '../middlewares/validators/platform.validator.js';
import { authMiddleware, authHandler, adminHandler } from "../middlewares/authHandler.js";

const router = e.Router()

// Basic Platform

router.post(
  '/platform',
  authMiddleware, authHandler, adminHandler, 
  validators.name,
  controllers.createPlatform
)
router.get('/platform/:platformId', validators.platformId, controllers.getPlatformDetail)
router.put(
  '/platform/:platformId',
  authMiddleware, authHandler, adminHandler, 
  validators.platformId, validators.name,
  controllers.updatePlatform
)
router.delete(
  '/platform/:platformId',
  authMiddleware, authHandler, adminHandler, 
  validators.platformId,
  controllers.deletePlatform
)
router.get('/platform', controllers.getPlatforms)

// Anime Platform

router.post(
  '/:animeId/platform/:platformId', 
  authMiddleware, authHandler, adminHandler, 
  validators.animeId, validators.platformId, validators.createAnimePlatform,
  controllers.createAnimePlatform
);
router.get('/:animeId/platform/:platformId', validators.animeId, validators.platformId, controllers.getAnimePlatformDetail);
router.put(
  '/:animeId/platform/:platformId',
  authMiddleware, authHandler, adminHandler,
  validators.animeId, validators.platformId, validators.updateAnimePlatform,
  controllers.updateAnimePlatform
);
router.patch(
  '/:animeId/platform/:platformId',
  authMiddleware, authHandler, adminHandler,
  validators.animeId, validators.platformId, validators.createOrUpdateAnimePlatform,
  controllers.createOrUpdateAnimePlatform
);
router.delete(
  '/:animeId/platform/:platformId',
  authMiddleware, authHandler, adminHandler,
  validators.animeId, validators.platformId,
  controllers.deleteAnimePlatform
);
router.get('/:animeId/platform', validators.animeId, controllers.getAnimePlatforms);

export default router;