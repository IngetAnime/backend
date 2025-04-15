import e from "express";
import * as controllers from '../controller/platform.controller.js';
import * as validators from '../middlewares/validators/platform.validator.js';
import { authMiddleware, authHandler, adminHandler } from "../middlewares/authHandler.js";

const router = e.Router()

router.post('/', authMiddleware, authHandler, adminHandler, validators.createPlatform, controllers.createPlatform);
router.get('/:platformId', validators.getPlatformDetail, controllers.getPlatformDetail);
router.patch(
  '/:platformId', 
  authMiddleware, authHandler, adminHandler,
  validators.getPlatformDetail, validators.updatePlatrom,
  controllers.updatePlatrom
)
router.delete(
  '/:platformId', 
  authMiddleware, authHandler, adminHandler, 
  validators.getPlatformDetail, 
  controllers.deletePlatform
)
router.get('/', validators.getAllPlatforms, controllers.getAllPlatforms);

export default router;