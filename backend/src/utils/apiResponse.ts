import { Request, Response, NextFunction } from 'express';
import { HttpStatusCode } from './httpStatusCode';

interface Metadata {
  [key: string]: any;
}

interface Links {
  [key: string]: string;
}

interface ErrorDetails {
  [key: string]: any;
}

declare global {
  namespace Express {
    interface Response {
      success: (data: any,message?: string, metadata?: Metadata, links?: Links) => void;
      error: (message: string, code?: number, details?: ErrorDetails) => void;
    }
  }
}

const apiResponse = (req: Request, res: Response, next: NextFunction): void => {
  res.success = (data: any,message:string="", metadata: Metadata = {}, links: Links = {}) => {
    res.status(HttpStatusCode.OK).json({
      status: true,
      data,
      message,
      metadata,
      links
    });
  };

  res.error = (message: string, code: number = HttpStatusCode.BAD_GATEWAY, details: ErrorDetails = {}) => {
    res.status(code).json({
      status: false,
      error: {
        code,
        message,
        details
      },
      metadata: {
        timestamp: new Date().toISOString(),
      }
    });
  };

  next();
};

export default apiResponse;
