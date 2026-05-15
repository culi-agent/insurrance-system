import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { SocialAuthService } from '../services/social-auth.service';
import { ApiResponse } from '../../../shared/utils/response';
import { AuthenticatedRequest } from '../../../shared/types';

export class AuthController {
  private authService: AuthService;
  private socialAuthService: SocialAuthService;

  constructor() {
    this.authService = new AuthService();
    this.socialAuthService = new SocialAuthService();
  }

  register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.authService.register(req.body);
      ApiResponse.created(res, result);
    } catch (error) {
      next(error);
    }
  };

  verifyOtp = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.authService.verifyOtp(req.body);
      ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  };

  login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.authService.login({
        ...req.body,
        ip_address: req.ip,
        device_info: req.headers['user-agent'],
      });
      ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  };

  socialLogin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { provider, token } = req.body;
      let profile;

      if (provider === 'google') {
        profile = await this.socialAuthService.verifyGoogleToken(token);
      } else if (provider === 'facebook') {
        profile = await this.socialAuthService.verifyFacebookToken(token);
      } else {
        throw new Error('Unsupported provider');
      }

      const result = await this.socialAuthService.socialLogin(
        profile,
        req.ip,
        req.headers['user-agent'],
      );
      ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  };

  refreshToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.authService.refreshToken(req.body.refresh_token);
      ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  };

  logout = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.id;
      const refreshToken = req.body.refresh_token;
      const result = await this.authService.logout(userId, refreshToken);
      ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  };

  forgotPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.authService.forgotPassword(req.body.email_or_phone);
      ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  };

  resetPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.authService.resetPassword(req.body);
      ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  };

  changePassword = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.id;
      const result = await this.authService.changePassword(userId, req.body);
      ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  };

  resendOtp = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.authService.resendOtp(req.body);
      ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  };

  getProfile = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.id;
      const result = await this.authService.getProfile(userId);
      ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  };

  updateProfile = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.id;
      const result = await this.authService.updateProfile(userId, req.body);
      ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  };

  getSocialAccounts = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.id;
      const result = await this.socialAuthService.getSocialAccounts(userId);
      ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  };

  unlinkSocialAccount = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.id;
      const { provider } = req.params;
      const result = await this.socialAuthService.unlinkSocialAccount(userId, provider);
      ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  };
}
