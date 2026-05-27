import { RegisterService } from './register';
import { LoginService } from './login';
import { VerifyEmailService } from './verifyEmail';
import { CompleteProfileService } from './completeProfile';

// Create instances of all services
const registerService = new RegisterService();
const loginService = new LoginService();
const verifyEmailService = new VerifyEmailService();
const completeProfileService = new CompleteProfileService();

// Export the main AuthController class that combines all services
export default class AuthController {
  // Register related methods
  register = registerService.register;
  
  // Login related methods
  login = loginService.login;
  
  // Email verification related methods
  verifyEmail = verifyEmailService.verifyEmail;
  
  // Profile completion related methods
  completeProfile = completeProfileService.completeProfile;
}

// Also export individual services for direct use if needed
export {
  RegisterService,
  LoginService,
  VerifyEmailService,
  CompleteProfileService,
  registerService,
  loginService,
  verifyEmailService,
  completeProfileService
};
