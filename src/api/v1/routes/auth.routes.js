import e from "express";
import * as controllers from '../controller/auth.controller.js';
import * as validators from '../middlewares/validators/auth.validator.js';
import { adminHandler, authHandler, authMiddleware, emailVerificationhHandler, resetPasswordHandler } from "../middlewares/authHandler.js";

const router = e.Router();

router.post('/register', validators.register, controllers.register);
router.post('/resend-verification', authMiddleware, authHandler, controllers.resendEmailVerification);
router.post('/verify-email', authMiddleware, emailVerificationhHandler, controllers.verifyEmail);
router.post('/login', validators.login, controllers.login);
router.post('/logout', controllers.logout);
router.post('/forgot-password', validators.forgotPassword, controllers.forgotPassword);
router.post('/reset-password', authMiddleware, resetPasswordHandler, validators.resetPassword, controllers.resetPassword);
router.get('/google', controllers.getGoogleAuthUrl);
router.post('/google', validators.codeValidator, controllers.loginWithGoogle);
router.get('/mal', controllers.getMALAuthUrl);
router.post('/mal', validators.codeValidator, controllers.loginWithMAL);
router.get('/me', authMiddleware, authHandler, controllers.isAuthenticated);
router.get('/is-admin', authMiddleware, authHandler, adminHandler, controllers.isAdmin);

export default router;