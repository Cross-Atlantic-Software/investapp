import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { UserRole } from "../Roles";

interface User {
  user_id: string;
  role: number;
  email?: string;
  first_name?: string;
  last_name?: string;
  iat: number;
  exp: number;
  location?: { type: "Point"; coordinates: [number, number] };
}

export default function adminMiddleware(req: Request, res: Response, next: NextFunction): void {
  // Extract the token (support both the "token" header and "Authorization: Bearer <token>")
  let token = req.header("token");
  if (!token) {
    const authHeader = req.header("Authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.substring(7);
    }
  }
  // If no token is provided, send an authentication error and terminate the request
  if (!token) {
    res.status(401).json({ message: "Auth Error", status: false });
    return;
  }

  // Fail closed: never fall back to a hard-coded secret.
  const tokenSecret = process.env.TOKEN_SECRET;
  if (!tokenSecret) {
    res.status(500).json({ message: "Server misconfigured: TOKEN_SECRET is missing", status: false });
    return;
  }

  try {
    // Verify the token and decode it
    const decoded = jwt.verify(token, tokenSecret) as User
    // Attach the decoded user to the request object
    // Allow all CMS users to access admin panel (Admin, SuperAdmin, Blogger, SiteManager)
    if(decoded.role !== UserRole.Admin && 
       decoded.role !== UserRole.SuperAdmin && 
       decoded.role !== UserRole.Blogger && 
       decoded.role !== UserRole.SiteManager){
        res.status(401).json({ message: "Auth Error", status: false });
        return;
    }
    (req as any).user = decoded;
    // Pass control to the next middleware only if the token is valid
    next();  // Continue to the next middleware
  } catch (e) {
     res.status(401).json({ message: "Invalid Token", status: false });  // Return response directly
     return
  }
}
