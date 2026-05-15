import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { validate } from '../../../shared/middleware/validate';
import { authenticate } from '../../../shared/middleware/authenticate';
import { authRateLimiter, loginRateLimiter } from '../../../shared/middleware/rateLimiter';
import {
  registerSchema,
  loginSchema,
  socialLoginSchema,
  verifyOtpSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
  updateProfileSchema,
  resendOtpSchema,
  refreshTokenSchema,
} from '../validators/auth.validator';

const router = Router();
const authController = new AuthController();

// Public routes
router.post('/register', authRateLimiter, validate(registerSchema), authController.register);
router.post('/verify-otp', validate(verifyOtpSchema), authController.verifyOtp);
router.post('/resend-otp', authRateLimiter, validate(resendOtpSchema), authController.resendOtp);
router.post('/login', loginRateLimiter, validate(loginSchema), authController.login);
router.post('/social-login', validate(socialLoginSchema), authController.socialLogin);
router.post('/refresh-token', validate(refreshTokenSchema), authController.refreshToken);
router.post('/forgot-password', authRateLimiter, validate(forgotPasswordSchema), authController.forgotPassword);
router.post('/reset-password', validate(resetPasswordSchema), authController.resetPassword);

// Protected routes
router.post('/logout', authenticate, authController.logout);
router.get('/profile', authenticate, authController.getProfile);
router.put('/profile', authenticate, validate(updateProfileSchema), authController.updateProfile);
router.post('/change-password', authenticate, validate(changePasswordSchema), authController.changePassword);

// Social account management
router.get('/social-accounts', authenticate, authController.getSocialAccounts);
router.delete('/social-accounts/:provider', authenticate, authController.unlinkSocialAccount);

export default router;
