import e from "express";
import * as controllers from '../controller/auth.controller.js';
import * as validators from '../middlewares/validators/auth.validator.js';
import { adminHandler, authHandler, authMiddleware, emailVerificationhHandler, optAuthMiddleware, resetPasswordHandler } from "../middlewares/authHandler.js";

const router = e.Router();

router.post('/register', validators.register, controllers.register);
router.post('/resend-verification', authMiddleware, authHandler, controllers.resendEmailVerification);
router.post('/verify-email', authMiddleware, emailVerificationhHandler, controllers.verifyEmail);
router.post('/login', validators.login, controllers.login);
router.post('/logout', controllers.logout);
router.post('/forgot-password', validators.forgotPassword, controllers.forgotPassword);
router.post('/reset-password', authMiddleware, resetPasswordHandler, validators.resetPassword, controllers.resetPassword);
router.get('/google', validators.generateAuth, controllers.getGoogleAuthUrl);
router.post('/google', optAuthMiddleware, validators.loginOrConnect, controllers.loginWithGoogle);
router.get('/mal', validators.generateAuth, controllers.getMALAuthUrl);
router.post('/mal', optAuthMiddleware, validators.loginOrConnect, controllers.loginWithMAL);
router.get('/me', authMiddleware, authHandler, controllers.isAuthenticated);
router.get('/is-admin', authMiddleware, authHandler, adminHandler, controllers.isAdmin);

export default router;