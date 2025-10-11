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

export const uploadPdf = multer({
  storage: multerS3({
    s3,
    bucket: process.env.S3_BUCKET!,
    contentType: (req, file, cb) => {
      cb(null, file.mimetype);
    },
    key: (_req: Request, file: any, cb: (error: any, key?: string) => void) => {
      const uniqueName = `pdfs/${Date.now()}-${file.originalname}`;
      cb(null, uniqueName);
    },
  }),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Only accept PDF files
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  }
});

export const uploadBanner = multer({
  storage: multerS3({
    s3,
    bucket: process.env.S3_BUCKET!,
    contentType: (req, file, cb) => {
      cb(null, file.mimetype);
    },
    key: (_req: Request, file: any, cb: (error: any, key?: string) => void) => {
      const uniqueName = `banners/${Date.now()}-${file.originalname}`;
      cb(null, uniqueName);
    },
  }),
  fileFilter: (req, file, cb) => {
    // Only accept image files for banners
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed for banners'));
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit for banners
  }
});

// KYC Document Upload Middleware
export const uploadKYCDocuments = multer({
  storage: multerS3({
    s3,
    bucket: process.env.S3_BUCKET!,
    contentType: (req, file, cb) => {
      cb(null, file.mimetype);
    },
    key: (req: Request, file: any, cb: (error: any, key?: string) => void) => {
      // Get user_id from authenticated user
      const user_id = (req as any).user?.user_id || 'unknown';
      const timestamp = Date.now();
      const fileExtension = file.originalname.split('.').pop();
      
      // Determine file type based on field name
      let fileType = 'documents';
      if (file.fieldname === 'bank_proof') {
        fileType = 'bank_proof';
      } else if (file.fieldname === 'sign') {
        fileType = 'signature';
      }
      
      const uniqueName = `kyc/${user_id}/${fileType}_${timestamp}.${fileExtension}`;
      cb(null, uniqueName);
    },
  }),
  fileFilter: (req, file, cb) => {
    // Accept PDF, JPG, PNG files for KYC documents
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/jpg', 
      'image/png'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF, JPG, and PNG files are allowed for KYC documents'));
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit for KYC documents
  }
});
