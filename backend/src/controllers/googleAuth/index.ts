import { GoogleAuthService } from './googleAuth';
import { GoogleCallbackService } from './googleCallback';
import { GoogleTokenVerifyService } from './googleTokenVerify';

// Create instances of all services
const googleAuthService = new GoogleAuthService();
const googleCallbackService = new GoogleCallbackService();
const googleTokenVerifyService = new GoogleTokenVerifyService();

// Export the main GoogleAuthController class that combines all services
export default class GoogleAuthController {
  // Google OAuth initiation
  googleAuth = googleAuthService.googleAuth;
  
  // Google OAuth callback handling
  googleCallback = googleCallbackService.googleCallback;
  
  // Google token verification
  googleTokenVerify = googleTokenVerifyService.googleTokenVerify;
}

// Also export individual services for direct use if needed
export {
  GoogleAuthService,
  GoogleCallbackService,
  GoogleTokenVerifyService,
  googleAuthService,
  googleCallbackService,
  googleTokenVerifyService
};
