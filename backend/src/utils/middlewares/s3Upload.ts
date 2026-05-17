import multer from "multer";
import { Request } from "express";
import { S3Client } from "@aws-sdk/client-s3";
import multerS3 from "multer-s3";

const isS3Configured = !!(
  process.env.AWS_REGION &&
  process.env.AWS_ACCESS_KEY_ID &&
  process.env.AWS_SECRET_ACCESS_KEY &&
  process.env.S3_BUCKET
);

if (!isS3Configured) {
  console.warn("⚠️  AWS S3 environment variables not configured. File uploads will not work.");
  console.warn("Required: AWS_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, S3_BUCKET");
}

const s3 = isS3Configured
  ? new S3Client({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
    })
  : null;

type KeyCallback = (req: Request, file: Express.Multer.File, cb: (error: any, key?: string) => void) => void;
type ContentTypeCallback = (req: any, file: any, cb: (error: any, contentType?: string) => void) => void;

function buildStorage(keyFn: KeyCallback, contentTypeFn?: ContentTypeCallback): multer.StorageEngine {
  if (!isS3Configured || !s3) {
    return multer.memoryStorage();
  }
  return multerS3({
    s3,
    bucket: process.env.S3_BUCKET!,
    contentType: contentTypeFn ?? ((req, file, cb) => cb(null, file.mimetype)),
    key: keyFn as any,
  });
}

export const uploadIcon = multer({
  storage: buildStorage((_req, file, cb) => {
    cb(null, `icons/${Date.now()}-${file.originalname}`);
  }),
  fileFilter: (_req, file, cb) => {
    cb(null, file.mimetype.startsWith("image/"));
  },
});

export const uploadBlogImage = multer({
  storage: buildStorage(
    (_req, file, cb) => {
      const folder = file.mimetype === "video/mp4" ? "insight-videos" : "blog-images";
      console.log("🔑 S3 Key:", `${folder}/${Date.now()}-${file.originalname}`);
      cb(null, `${folder}/${Date.now()}-${file.originalname}`);
    },
    (_req: any, file: any, cb: (error: any, contentType?: string) => void) => {
      console.log("📁 File upload:", file.originalname, "MIME:", file.mimetype);
      cb(null, file.mimetype);
    }
  ),
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith("image/") || file.mimetype === "video/mp4") {
      cb(null, true);
    } else {
      cb(new Error("Only image and MP4 video files are allowed"));
    }
  },
  limits: { fileSize: 100 * 1024 * 1024 },
});

export const uploadPdf = multer({
  storage: buildStorage((_req, file, cb) => {
    cb(null, `pdfs/${Date.now()}-${file.originalname}`);
  }),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are allowed"));
    }
  },
});

export const uploadBanner = multer({
  storage: buildStorage((_req, file, cb) => {
    cb(null, `banners/${Date.now()}-${file.originalname}`);
  }),
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed for banners"));
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 },
});

export const uploadInsightVideo = multer({
  storage: buildStorage((_req, file, cb) => {
    cb(null, `insight-videos/${Date.now()}-${file.originalname}`);
  }),
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === "video/mp4") {
      cb(null, true);
    } else {
      cb(new Error("Only MP4 video files are allowed for insight videos"));
    }
  },
  limits: { fileSize: 100 * 1024 * 1024 },
});

export const uploadKnowledgeCenterImage = multer({
  storage: buildStorage(
    (_req, file, cb) => {
      const folder = file.mimetype === "video/mp4" ? "knowledge-videos" : "knowledge-blogs";
      console.log("🔑 Knowledge Center S3 Key:", `${folder}/${Date.now()}-${file.originalname}`);
      cb(null, `${folder}/${Date.now()}-${file.originalname}`);
    },
    (_req: any, file: any, cb: (error: any, contentType?: string) => void) => {
      console.log("📁 Knowledge Center file upload:", file.originalname, "MIME:", file.mimetype);
      cb(null, file.mimetype);
    }
  ),
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith("image/") || file.mimetype === "video/mp4") {
      cb(null, true);
    } else {
      cb(new Error("Only image and MP4 video files are allowed"));
    }
  },
  limits: { fileSize: 100 * 1024 * 1024 },
});

export const uploadHomeInsightFile = multer({
  storage: buildStorage((_req, file, cb) => {
    cb(null, `home-insights/${Date.now()}-${file.originalname}`);
  }),
  limits: { fileSize: 50 * 1024 * 1024 },
});

export const uploadKYCDocuments = multer({
  storage: buildStorage((req, file, cb) => {
    const user_id = (req as any).user?.user_id || "unknown";
    const timestamp = Date.now();
    const fileExtension = file.originalname.split(".").pop();

    const fieldMap: Record<string, string> = {
      bank_proof: "bank_proof",
      sign: "signature",
      pan: "pan",
      aadhar: "aadhar",
      demat: "demat",
    };
    const fileType = fieldMap[file.fieldname] ?? "documents";

    cb(null, `kyc/${user_id}/${fileType}_${timestamp}.${fileExtension}`);
  }),
  fileFilter: (_req, file, cb) => {
    const allowed = ["application/pdf", "image/jpeg", "image/jpg", "image/png"];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only PDF, JPG, and PNG files are allowed for KYC documents"));
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 },
});
