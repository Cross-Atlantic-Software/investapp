import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { db } from "../../utils/database";
import { UserRole } from "../../utils/Roles";

// User interface is defined in admin-middleware.ts

// CMS User Login
export const cmsLogin = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required"
      });
    }

    // Find CMS user by email
    const user = await db.CmsUser.findOne({ where: { email } });
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials"
      });
    }

    // Check if user is active
    if (user.status !== 1) {
      return res.status(401).json({
        success: false,
        message: "Account is deactivated"
      });
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials"
      });
    }

    // Generate JWT token
    const tokenSecret = process.env.TOKEN_SECRET || "fnknwdfnnnfsdklnfslkfsdkfnslkfnksnfnsllsfkfsnfnklsnflnleoiw";
    const token = jwt.sign(
      {
        user_id: user.id.toString(),
        role: user.role,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name
      },
      tokenSecret,
      { expiresIn: "7d" }
    );

    // Return user data without password
    const { password: _, ...userWithoutPassword } = user.toJSON();

    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        user: userWithoutPassword,
        token
      }
    });
  } catch (error) {
    console.error("Error in CMS login:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};
