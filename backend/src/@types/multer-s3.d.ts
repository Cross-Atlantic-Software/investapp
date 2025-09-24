declare module 'multer-s3' {
  interface MulterS3Options {
    s3: any;
    bucket: string;
    acl?: string;
    key?: (req: any, file: any, cb: (error: any, key?: string) => void) => void;
    contentType?: (req: any, file: any, cb: (error: any, contentType?: string) => void) => void;
    metadata?: (req: any, file: any, cb: (error: any, metadata?: any) => void) => void;
  }

  function multerS3(options: MulterS3Options): any;
  export default multerS3;
}
