import e from "express";
import * as controllers from '../controller/user.controller.js';
import * as validators from '../middlewares/validators/user.validator.js';
import { authMiddleware, authHandler } from "../middlewares/authHandler.js";

const router = e.Router()

router.get('/@me/my-list-status', authMiddleware, authHandler, validators.getAnimeList, controllers.getAnimeList);
router.post('/@me/import-list-mal', authMiddleware, authHandler, validators.importAnimeList, controllers.importAnimeList);
router.get('/@me', authMiddleware, authHandler, controllers.getUserDetail);

export default router;