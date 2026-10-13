import multer from "multer";
import path from "path";
import fs from "fs";

const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});


// const fileFilter = (req, file, cb) => {
//   const allowedExtensions = /jpeg|jpg|png|webp/;
//   const extName = allowedExtensions.test(path.extname(file.originalname).toLowerCase());

//   if (extName) {
//     return cb(null, true);
//   }
//   cb(new Error('Only JPEG, PNG, and WebP image files are allowed'));
// };


const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, 
  },
  // fileFilter
});

export const uploadSingleImage = upload.single("image");

export const uploadJobMedia = upload.fields([
  { name: 'images', maxCount: 5 }, // Multiple images (up to 5)
  { name: 'video', maxCount: 1 },  // Single video
]);
