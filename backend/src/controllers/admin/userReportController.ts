import { Request, Response } from "express";
import { db } from "../../utils/database";
import multer from "multer";
import multerS3 from "multer-s3";
import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";

// Configure S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

// Configure multer for S3 upload - following the same pattern as logo uploads
export const upload = multer({
  storage: multerS3({
    s3: s3Client,
    bucket: process.env.S3_BUCKET!,
    contentType: (req, file, cb) => {
      cb(null, file.mimetype);
    },
    key: (req: Request, file: any, cb: (error: any, key?: string) => void) => {
      const userId = (req as any).params.userId;
      const uniqueName = `user-reports/${userId}_${Date.now()}.pdf`;
      cb(null, uniqueName);
    },
  }),
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

export class UserReportController {
  static async uploadReport(req: Request, res: Response) {
    try {
      await db.sequelizePromise;
      const { userId } = (req as any).params;

      const user = await db.User.findByPk(userId);
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      // Delete existing report if any
      if (user.report_file) {
        try {
          // Extract S3 key from the URL
          const s3Key = user.report_file.split('/').slice(-2).join('/'); // Get 'user-reports/filename'
          await s3Client.send(new DeleteObjectCommand({
            Bucket: process.env.S3_BUCKET!,
            Key: s3Key,
          }));
        } catch (error) {
          console.error('Error deleting existing report:', error);
        }
      }

      if (!req.file) {
        return res.status(400).json({ success: false, message: 'No file uploaded' });
      }

      const s3File = req.file as any;
      const s3Url = s3File.location || `https://${process.env.S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${s3File.key}`;

      // Update user with just the S3 URL - same pattern as logo field
      await user.update({
        report_file: s3Url,
      });

      res.json({ success: true, message: 'Report uploaded successfully', data: { s3Url } });
    } catch (error) {
      console.error('Error uploading report:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  static async getUserReport(req: Request, res: Response) {
    try {
      await db.sequelizePromise;
      const { userId } = (req as any).params;

      const user = await db.User.findByPk(userId, {
        attributes: ['id', 'first_name', 'last_name', 'email', 'report_file']
      });

      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      res.json({
        success: true,
        data: {
          hasReport: !!user.report_file,
          filename: user.report_file ? user.report_file.split('/').pop() : null,
          s3Url: user.report_file,
        }
      });
    } catch (error) {
      console.error('Error getting user report:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  static async deleteUserReport(req: Request, res: Response) {
    try {
      await db.sequelizePromise;
      const { userId } = (req as any).params;
      
      console.log(`🗑️ Deleting report for user ID: ${userId}`);

      const user = await db.User.findByPk(userId);
      if (!user) {
        console.log('❌ User not found');
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      console.log(`📄 Current report_file: ${user.report_file}`);

      if (!user.report_file) {
        console.log('❌ No report found for this user');
        return res.status(404).json({ success: false, message: 'No report found for this user' });
      }

      // Delete from S3
      try {
        console.log(`🔍 Full S3 URL: ${user.report_file}`);
        const s3Key = user.report_file.split('/').slice(-2).join('/');
        console.log(`🗑️ Deleting from S3 with key: ${s3Key}`);
        console.log(`🗑️ S3 Bucket: ${process.env.S3_BUCKET}`);
        
        await s3Client.send(new DeleteObjectCommand({
          Bucket: process.env.S3_BUCKET!,
          Key: s3Key,
        }));
        
        console.log('✅ Successfully deleted from S3');
      } catch (error) {
        console.error('❌ Error deleting report from S3:', error);
        console.error('❌ S3 Error details:', error instanceof Error ? error.message : String(error));
      }

      // Clear the report_file field - same pattern as logo field
      console.log('🔄 Clearing report_file field in database...');
      console.log('📊 Before update - report_file:', user.report_file);
      
      // Try different approaches to clear the field
      try {
        // Method 1: Set to undefined
        const updateResult = await user.update({
          report_file: undefined,
        });
        console.log('📊 Method 1 (undefined) - Update result:', updateResult);
        console.log('📊 Method 1 (undefined) - After update - report_file:', updateResult.report_file);
      } catch (error) {
        console.error('❌ Method 1 failed:', error);
      }
      
      try {
        // Method 2: Set to empty string
        const updateResult2 = await user.update({
          report_file: '',
        });
        console.log('📊 Method 2 (empty string) - Update result:', updateResult2);
        console.log('📊 Method 2 (empty string) - After update - report_file:', updateResult2.report_file);
      } catch (error) {
        console.error('❌ Method 2 failed:', error);
      }
      
      try {
        // Method 3: Use set and save
        user.set('report_file', undefined);
        await user.save();
        console.log('📊 Method 3 (set/save) - After save - report_file:', user.report_file);
      } catch (error) {
        console.error('❌ Method 3 failed:', error);
      }
      
      // Verify the update by fetching the user again
      const updatedUser = await db.User.findByPk(userId, {
        attributes: ['id', 'report_file']
      });
      console.log('📊 Verification fetch - report_file:', updatedUser?.report_file);
      
      console.log('✅ Successfully cleared report_file field');

      res.json({ success: true, message: "Report deleted successfully" });
    } catch (error) {
      console.error('❌ Error deleting user report:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  static async getCurrentUserReport(req: Request, res: Response) {
    try {
      await db.sequelizePromise;
      
      console.log('🔐 Backend: Request received');
      console.log('🔐 Backend: req.user:', req.user);
      console.log('🔐 Backend: req.user?.user_id:', (req as any).user?.user_id);
      
      const userId = (req as any).user?.user_id;

      if (!userId) {
        console.log('❌ Backend: No user ID found in request');
        return res.status(401).json({ success: false, message: 'User not authenticated' });
      }

      console.log('✅ Backend: User ID found:', userId);

      const user = await db.User.findByPk(userId, {
        attributes: ['id', 'first_name', 'last_name', 'email', 'report_file']
      });

      if (!user) {
        console.log('❌ Backend: User not found in database');
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      console.log('✅ Backend: User found:', user.first_name, user.last_name);
      console.log('📄 Backend: User report_file:', user.report_file);

      res.json({
        success: true,
        data: {
          hasReport: !!user.report_file,
          filename: user.report_file ? user.report_file.split('/').pop() : null,
          s3Url: user.report_file,
        }
      });
    } catch (error) {
      console.error('❌ Backend: Error getting current user report:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }
}