import express from "express";
import { EmailVerifyValidation, loginValidation, registerValidation, completeProfileValidation } from "../utils/formValidation/form-validation";
import AuthController from "../controllers/AuthController";
import jwtAuthMiddleware from "../utils/middleware";

const AuthCtrl = new AuthController();

const authRouter = express.Router();

authRouter.post('/register',registerValidation, AuthCtrl.register);
authRouter.post('/login',loginValidation, AuthCtrl.login);
authRouter.post('/verify-email',EmailVerifyValidation, AuthCtrl.verifyEmail);
authRouter.post('/complete-profile', jwtAuthMiddleware, completeProfileValidation, AuthCtrl.completeProfile);

export default authRouter;
