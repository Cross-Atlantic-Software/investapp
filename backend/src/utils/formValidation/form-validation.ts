import Joi from "joi";
import { validateRequired } from "./validate-required"; // Adjust path as needed
export const loginValidation = validateRequired(
    Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().required(),
    })
);
export const registerValidation = validateRequired(
    Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().required(),
    })
);
export const EmailVerifyValidation = validateRequired(
    Joi.object({
        email: Joi.string().email().required(),
        code: Joi.string().required(),
    })
);

export const completeProfileValidation = validateRequired(
    Joi.object({
        first_name: Joi.string().required(),
        last_name: Joi.string().required(),
        email: Joi.string().email().required(),
        phone: Joi.string().required(),
        source: Joi.string().required(),
    })
);