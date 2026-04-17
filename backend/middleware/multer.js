import multer from "multer";

const storage = multer.memoryStorage({});

const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
const allowedImageMimeTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

const fileFilter = (_req, file, cb) => {
  if (!allowedImageMimeTypes.has(file.mimetype)) {
    return cb(new Error("Only JPEG, PNG, WEBP, and GIF files are allowed"));
  }
  cb(null, true);
};

export const upload = multer({
  storage,
  limits: {
    fileSize: MAX_IMAGE_SIZE_BYTES,
    files: 1,
  },
  fileFilter,
});