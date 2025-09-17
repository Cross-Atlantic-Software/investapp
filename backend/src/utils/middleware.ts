import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

// TypeScript type for the user object attached to the request
interface User {
  user_id: string;
  role: number;
  iat:number;
  exp:number;
  location?: {
    type: "Point";
    coordinates: [number, number];
  };
}

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

export default function jwtAuthMiddleware(req: Request, res: Response, next: NextFunction): void {
  // Debug logging
  console.log('🔍 JWT Middleware - Received headers:', req.headers);
  console.log('🔍 Authorization header:', req.headers.authorization);
  
  // Extract the token from the request header (support both "token" and "Authorization: Bearer <token>")
  let token = req.header("token");
  
  // If no token in "token" header, try Authorization header
  if (!token) {
    const authHeader = req.header("Authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.substring(7); // Remove "Bearer " prefix
    }
  }
  
  console.log('🔍 Extracted token:', token ? token.substring(0, 20) + '...' : 'No token');
  
  // If no token is provided, send an authentication error and terminate the request
  if (!token) {
    res.status(401).json({ 
      status: false,
      error: {
        code: 401,
        message: "No token provided",
        details: "Authorization header with Bearer token is required"
      }
    });
    return;
  }

  try {
    // Verify the token and decode it
    const decoded = jwt.verify(token, process.env.TOKEN_SECRET as string) as User;
    console.log('✅ Token verified successfully for user:', decoded.user_id);
    
    // Attach the decoded user to the request object
    req.user = decoded;
    // Pass control to the next middleware only if the token is valid
    next();  // Continue to the next middleware
  } catch (error: any) {
    console.log('❌ Token verification failed:', error.message);
    res.status(401).json({ 
      status: false,
      error: {
        code: 401,
        message: "Invalid or expired token",
        details: error.message
      }
    });
    return;
  }
}
