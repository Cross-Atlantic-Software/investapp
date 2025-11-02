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

export const uploadBlogImage = multer({
  storage: multerS3({
    s3,
    bucket: process.env.S3_BUCKET!,
    contentType: (req, file, cb) => {
      console.log('📁 File upload:', file.originalname, 'MIME:', file.mimetype);
      cb(null, file.mimetype);
    },
    key: (_req: Request, file: any, cb: (error: any, key?: string) => void) => {
      // Check if it's a video or image based on mimetype
      const isVideo = file.mimetype === 'video/mp4';
      const folder = isVideo ? 'insight-videos' : 'blog-images';
      const uniqueName = `${folder}/${Date.now()}-${file.originalname}`;
      console.log('🔑 S3 Key:', uniqueName);
      cb(null, uniqueName);
    },
  }),
  fileFilter: (req, file, cb) => {
    // Accept both image files and MP4 videos for market insights
    if (file.mimetype.startsWith('image/') || file.mimetype === 'video/mp4') {
      cb(null, true);
    } else {
      cb(new Error('Only image and MP4 video files are allowed'));
    }
  },
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit to accommodate videos
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

export const uploadInsightVideo = multer({
  storage: multerS3({
    s3,
    bucket: process.env.S3_BUCKET!,
    contentType: (req, file, cb) => {
      cb(null, file.mimetype);
    },
    key: (_req: Request, file: any, cb: (error: any, key?: string) => void) => {
      const uniqueName = `insight-videos/${Date.now()}-${file.originalname}`;
      cb(null, uniqueName);
    },
  }),
  fileFilter: (req, file, cb) => {
    // Only accept MP4 video files
    if (file.mimetype === 'video/mp4') {
      cb(null, true);
    } else {
      cb(new Error('Only MP4 video files are allowed for insight videos'));
    }
  },
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit for videos
  }
});

// Knowledge Center Upload Middleware - Separate folders for Knowledge Center content
export const uploadKnowledgeCenterImage = multer({
  storage: multerS3({
    s3,
    bucket: process.env.S3_BUCKET!,
    contentType: (req, file, cb) => {
      console.log('📁 Knowledge Center file upload:', file.originalname, 'MIME:', file.mimetype);
      cb(null, file.mimetype);
    },
    key: (_req: Request, file: any, cb: (error: any, key?: string) => void) => {
      // Check if it's a video or image based on mimetype
      const isVideo = file.mimetype === 'video/mp4';
      const folder = isVideo ? 'knowledge-videos' : 'knowledge-blogs';
      const uniqueName = `${folder}/${Date.now()}-${file.originalname}`;
      console.log('🔑 Knowledge Center S3 Key:', uniqueName);
      cb(null, uniqueName);
    },
  }),
  fileFilter: (req, file, cb) => {
    // Accept both image files and MP4 videos for knowledge centers
    if (file.mimetype.startsWith('image/') || file.mimetype === 'video/mp4') {
      cb(null, true);
    } else {
      cb(new Error('Only image and MP4 video files are allowed'));
    }
  },
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit to accommodate videos
  }
});

// Home Insight File Upload Middleware
export const uploadHomeInsightFile = multer({
  storage: multerS3({
    s3,
    bucket: process.env.S3_BUCKET!,
    contentType: (req, file, cb) => {
      cb(null, file.mimetype);
    },
    key: (_req: Request, file: any, cb: (error: any, key?: string) => void) => {
      const uniqueName = `home-insights/${Date.now()}-${file.originalname}`;
      cb(null, uniqueName);
    },
  }),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit for home insight files
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
      } else if (file.fieldname === 'pan') {
        fileType = 'pan';
      } else if (file.fieldname === 'aadhar') {
        fileType = 'aadhar';
      } else if (file.fieldname === 'demat') {
        fileType = 'demat';
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
