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
router.get('/platform/:platformId(\\d+)', validators.platformId, controllers.getPlatformDetail)
router.put(
  '/platform/:platformId(\\d+)',
  authMiddleware, authHandler, adminHandler, 
  validators.platformId, validators.name,
  controllers.updatePlatform
)
router.delete(
  '/platform/:platformId(\\d+)',
  authMiddleware, authHandler, adminHandler, 
  validators.platformId,
  controllers.deletePlatform
)
router.get('/platform', controllers.getPlatforms)

// Anime Platform

router.post(
  '/:animeId(\\d+)/platform/:platformId(\\d+)', 
  authMiddleware, authHandler, adminHandler, 
  validators.animeId, validators.platformId, validators.createAnimePlatform,
  controllers.createAnimePlatform
);
router.get('/:animeId(\\d+)/platform/:platformId(\\d+)', validators.animeId, validators.platformId, controllers.getAnimePlatformDetail);
router.put(
  '/:animeId(\\d+)/platform/:platformId(\\d+)',
  authMiddleware, authHandler, adminHandler,
  validators.animeId, validators.platformId, validators.updateAnimePlatform,
  controllers.updateAnimePlatform
);
router.patch(
  '/:animeId(\\d+)/platform/:platformId(\\d+)',
  authMiddleware, authHandler, adminHandler,
  validators.animeId, validators.platformId, validators.createOrUpdateAnimePlatform,
  controllers.createOrUpdateAnimePlatform
);
router.delete(
  '/:animeId(\\d+)/platform/:platformId(\\d+)',
  authMiddleware, authHandler, adminHandler,
  validators.animeId, validators.platformId,
  controllers.deleteAnimePlatform
);
router.get('/:animeId/platform', validators.animeId, controllers.getAnimePlatforms);

export default router;