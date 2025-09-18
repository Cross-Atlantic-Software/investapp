import express from "express";
import { EmailVerifyValidation, loginValidation, registerValidation, completeProfileValidation } from "../utils/formValidation/form-validation";
import AuthController from "../controllers/auth";
import GoogleAuthController from "../controllers/googleAuth";
import jwtAuthMiddleware from "../utils/middleware";

const AuthCtrl = new AuthController();
const GoogleAuthCtrl = new GoogleAuthController();

const authRouter = express.Router();

authRouter.post('/register',registerValidation, AuthCtrl.register);
authRouter.post('/login',loginValidation, AuthCtrl.login);
authRouter.post('/verify-email',EmailVerifyValidation, AuthCtrl.verifyEmail);
authRouter.post('/complete-profile', jwtAuthMiddleware, completeProfileValidation, AuthCtrl.completeProfile);

// Google OAuth routes
authRouter.get('/google', GoogleAuthCtrl.googleAuth);
authRouter.get('/google/callback', GoogleAuthCtrl.googleCallback);
authRouter.post('/google/verify', GoogleAuthCtrl.googleTokenVerify);

export default authRouter;
