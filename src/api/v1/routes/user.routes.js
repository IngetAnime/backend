import e from "express";
import * as controllers from '../controller/user.controller.js';
// import * as validators from '../middlewares/validators/platform.validator.js';
import { authMiddleware, authHandler } from "../middlewares/authHandler.js";

const router = e.Router()

router.get('/me', authMiddleware, authHandler, controllers.getUserDetail);

export default router;