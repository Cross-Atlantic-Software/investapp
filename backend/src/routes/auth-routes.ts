import express from "express";
import { EmailVerifyValidation, loginValidation, registerValidation, completeProfileValidation } from "../utils/formValidation/form-validation";
import AuthController from "../controllers/auth";
import GoogleAuthController from "../controllers/googleAuth";
import { ForgotPasswordService } from "../controllers/auth/forgotPassword";
import { ResetPasswordService } from "../controllers/auth/resetPassword";
import jwtAuthMiddleware from "../utils/middleware";
import { KYCManagementController } from "../controllers/admin/kycManagement";
import { uploadKYCDocuments } from "../utils/middlewares/s3Upload";

const AuthCtrl = new AuthController();
const GoogleAuthCtrl = new GoogleAuthController();
const ForgotPasswordCtrl = new ForgotPasswordService();
const ResetPasswordCtrl = new ResetPasswordService();
const kycController = new KYCManagementController();

const authRouter = express.Router();

authRouter.post('/register',registerValidation, AuthCtrl.register);
authRouter.post('/login',loginValidation, AuthCtrl.login);
authRouter.post('/verify-email',EmailVerifyValidation, AuthCtrl.verifyEmail);
authRouter.post('/complete-profile', jwtAuthMiddleware, completeProfileValidation, AuthCtrl.completeProfile);

// Password reset routes
authRouter.post('/forgot-password', ForgotPasswordCtrl.forgotPassword);
authRouter.post('/reset-password', ResetPasswordCtrl.resetPassword);

// Google OAuth routes
authRouter.get('/google', GoogleAuthCtrl.googleAuth);
authRouter.get('/google/callback', GoogleAuthCtrl.googleCallback);
authRouter.post('/google/verify', GoogleAuthCtrl.googleTokenVerify);

// KYC routes for authenticated site users
authRouter.post('/kyc', jwtAuthMiddleware, uploadKYCDocuments.fields([
  { name: 'bank_proof', maxCount: 1 },
  { name: 'sign', maxCount: 1 }
]), kycController.createKYCApplication);
authRouter.get('/kyc/my', jwtAuthMiddleware, kycController.getMyKYCApplication);
authRouter.get('/kyc/status', jwtAuthMiddleware, kycController.getKYCStatus);

export default authRouter;
