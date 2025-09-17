import { Request, Response, NextFunction } from "express";
import { Schema } from "joi";

export const validateRequired = (schema: Schema) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        const options = {
            abortEarly: false,
            allowUnknown: true,
        };
        const { error, value } = schema.validate(req.body, options);
        if (error) {
            res.status(501).json({
                messages: `Validation error: ${error.details.map((x) => x.message).join(", ")}`,
                status: false,
            });
        } else {
            req.body = value;
            next();
        }
    };
};
