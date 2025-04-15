import e from "express";
import * as controllers from '../controller/schedule.controller.js';
import * as validators from '../middlewares/validators/schedule.validator.js';
import { authMiddleware, authHandler, adminHandler } from "../middlewares/authHandler.js";

const router = e.Router()

router.get(
  '/platform/:platformId', 
  authMiddleware, authHandler, adminHandler, 
  validators.platformId,
  controllers.getPlatformSchedule
)
router.patch(
  '/platform/:platformId', 
  authMiddleware, authHandler, adminHandler, 
  validators.platformId, validators.createOrUpdatePlatformSchedule,
  controllers.createOrUpdatePlatformSchedule
)
router.get(
  '/:id/platform',
  authMiddleware, authHandler, adminHandler, 
  validators.scheduleId,
  controllers.getPlatformScheduleById
)
router.delete(
  '/:id/platform',
  authMiddleware, authHandler, adminHandler, 
  validators.scheduleId,
  controllers.deletePlatformScheduleById
)
router.get(
  '/anime/:animeId', 
  authMiddleware, authHandler, adminHandler, 
  validators.animeId,
  controllers.getAnimeSchedule
)
router.patch(
  '/anime/:animeId', 
  authMiddleware, authHandler, adminHandler, 
  validators.animeId, validators.createOrUpdateAnimeSchedule,
  controllers.createOrUpdateAnimeSchedule
)
router.get(
  '/:id/anime',
  authMiddleware, authHandler, adminHandler, 
  validators.scheduleId,
  controllers.getAnimeScheduleById
)
router.delete(
  '/:id/anime',
  authMiddleware, authHandler, adminHandler, 
  validators.scheduleId,
  controllers.deleteAnimeScheduleById
)

export default router;