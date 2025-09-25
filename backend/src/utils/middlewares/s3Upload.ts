import multer from "multer";
import multerS3 from "multer-s3";
import { S3Client } from "@aws-sdk/client-s3";
import { Request } from "express";

// Validate required environment variables
if (!process.env.AWS_REGION || !process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY || !process.env.S3_BUCKET) {
  console.warn("⚠️  AWS S3 environment variables not configured. File uploads will not work.");
  console.warn("Required: AWS_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, S3_BUCKET");
}

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export const uploadIcon = multer({
  storage: multerS3({
    s3,
    bucket: process.env.S3_BUCKET!,
    // ACL removed - use bucket policy instead for public access
    contentType: (req, file, cb) => {
      // Set the content type based on the file's mimetype
      cb(null, file.mimetype);
    },
    key: (_req: Request, file: any, cb: (error: any, key?: string) => void) => {
      const uniqueName = `icons/${Date.now()}-${file.originalname}`;
      cb(null, uniqueName);
    },
  }),
  fileFilter: (req, file, cb) => {
    // Only accept image files for icons
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(null, false);
    }
  }
});
