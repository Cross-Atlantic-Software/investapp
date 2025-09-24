import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { UserRole } from "../Roles";

// TypeScript type for the user object attached to the request
interface User {
  user_id: string;
  role: number;
  email?: string;
  first_name?: string;
  last_name?: string;
  iat: number;
  exp: number;
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

export default function adminMiddleware(req: Request, res: Response, next: NextFunction): void {
  // Extract the token from the request header
  const token = req.header("token");
  // If no token is provided, send an authentication error and terminate the request
  if (!token) {
    res.status(401).json({ message: "Auth Error", status: false });
    return;
  }

  try {
    // Verify the token and decode it
    const decoded = jwt.verify(token, process.env.TOKEN_SECRET as string) as User 
    // Attach the decoded user to the request object
    // Allow all CMS users to access admin panel (Admin, SuperAdmin, Blogger, SiteManager)
    if(decoded.role !== UserRole.Admin && 
       decoded.role !== UserRole.SuperAdmin && 
       decoded.role !== UserRole.Blogger && 
       decoded.role !== UserRole.SiteManager){
        res.status(401).json({ message: "Auth Error", status: false });
        return;
    }
    req.user = decoded;
    // Pass control to the next middleware only if the token is valid
    next();  // Continue to the next middleware
  } catch (e) {
     res.status(401).json({ message: "Invalid Token", status: false });  // Return response directly
     return
  }
}
