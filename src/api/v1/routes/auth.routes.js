import e from "express";
import * as controllers from '../controller/auth.controller.js';
import * as validators from '../middlewares/validators/auth.validator.js';
import { authHandler, authMiddleware, emailVerificationhHandler, resetPasswordHandler } from "../middlewares/authHandler.js";

const router = e.Router();

router.post('/register', validators.register, controllers.register);
router.post('/resend-verification', authMiddleware, authHandler, controllers.resendEmailVerification);
router.post('/verify-email', authMiddleware, emailVerificationhHandler, controllers.verifyEmail);
router.post('/login', validators.login, controllers.login);
router.post('/logout', controllers.logout);
router.post('/forgot-password', validators.forgotPassword, controllers.forgotPassword);
router.post('/reset-password', authMiddleware, resetPasswordHandler, validators.resetPassword, controllers.resetPassword);
router.post('/google', validators.loginWithGoogle, controllers.loginWithGoogle);

export default router;