// import fs from "fs/promises";

// const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];
// const ALLOWED_VIDEO_MIMES = ['video/mp4', 'video/webm', 'video/quicktime'];

// const MAX_FILE_SIZE = 5 * 1024 * 1024;
// const MAX_VIDEO_SIZE = 50 * 1024 * 1024; 

// export const validateImageFile = async (
//   fileURLToPath,
//   originalMimeType,
//   fileSize,
// ) => {
//   if (fileSize > MAX_FILE_SIZE) {
//     throw new Error("File size exceeds the 5MB limit");
//   }

//   if (!ALLOWED_MIME_TYPES.includes(originalMimeType)) {
//     throw new Error("Invalid file type. Only JPEG, PNG, and WebP are allowed");
//   }

//   const fileBuffer = Buffer.alloc(8);
//   const fileHandle = await fs.open(fileURLToPath, "r");
//   await fileHandle.read(fileBuffer, 0, 8, 0);
//   await fileHandle.close();

//   const isJpeg =
//     fileBuffer[0] === 0xff && fileBuffer[1] === 0xd8 && fileBuffer[2] === 0xff;
//   const isPng =
//     fileBuffer[0] === 0x89 &&
//     fileBuffer[1] === 0x50 &&
//     fileBuffer[2] === 0x4e &&
//     fileBuffer[3] === 0x47;
//   const isWebp =
//     fileBuffer[0] === 0x52 &&
//     fileBuffer[1] === 0x49 &&
//     fileBuffer[2] === 0x46 &&
//     fileBuffer[3] === 0x46;

//     if (!isJpeg && !isPng && !isWebp) {
//     throw new Error('File header validation failed. Uploaded file is corrupted or spoofed');
//   }

//   return true
// };


import fs from 'fs/promises';

const ALLOWED_IMAGE_MIMES = ['image/jpeg', 'image/png', 'image/webp'];
const ALLOWED_VIDEO_MIMES = ['video/mp4', 'video/webm', 'video/quicktime'];

const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10 MB
const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50 MB


export const validateImageFile = async (filePath, originalMimeType, fileSize, isVideo = false) => {
  // 1. File Size Check
  const maxSize = isVideo ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE;
  if (fileSize > maxSize) {
    throw new Error(`File size exceeds limit of ${maxSize / (1024 * 1024)}MB`);
  }

  // 2. Allowed MIME Type Check
  const allowedMimes = isVideo ? ALLOWED_VIDEO_MIMES : ALLOWED_IMAGE_MIMES;
  if (!allowedMimes.includes(originalMimeType)) {
    throw new Error(`Invalid file type (${originalMimeType}). Allowed: ${allowedMimes.join(', ')}`);
  }

  // 3. Magic Bytes Check (File Header Verification)
  const buffer = Buffer.alloc(12);
  const fileHandle = await fs.open(filePath, 'r');
  await fileHandle.read(buffer, 0, 12, 0);
  await fileHandle.close();

  if (!isVideo) {
    // Image Magic Bytes Verification
    const isJpeg = buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
    const isPng = buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47;
    const isWebp = buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46;

    if (!isJpeg && !isPng && !isWebp) {
      throw new Error('Spoofed or corrupted image file detected');
    }
  } else {
    // Video Magic Bytes Verification (MP4 ftyp box / WebM / Quicktime)
    const isMp4OrMov = buffer[4] === 0x66 && buffer[5] === 0x74 && buffer[6] === 0x79 && buffer[7] === 0x70;
    const isWebm = buffer[0] === 0x1a && buffer[1] === 0x45 && buffer[2] === 0xdf && buffer[3] === 0xa3;

    if (!isMp4OrMov && !isWebm) {
      throw new Error('Spoofed or corrupted video file detected');
    }
  }

  return true;
};