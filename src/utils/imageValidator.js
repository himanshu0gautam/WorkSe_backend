import fs from "fs/promises";

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_FILE_SIZE = 5 * 1024 * 1024;

export const validateImageFile = async (
  fileURLToPath,
  originalMimeType,
  fileSize,
) => {
  if (fileSize > MAX_FILE_SIZE) {
    throw new Error("File size exceeds the 5MB limit");
  }

  if (!ALLOWED_MIME_TYPES.includes(originalMimeType)) {
    throw new Error("Invalid file type. Only JPEG, PNG, and WebP are allowed");
  }

  const fileBuffer = Buffer.alloc(8);
  const fileHandle = await fs.open(fileURLToPath, "r");
  await fileHandle.read(fileBuffer, 0, 8, 0);
  await fileHandle.close();

  const isJpeg =
    fileBuffer[0] === 0xff && fileBuffer[1] === 0xd8 && fileBuffer[2] === 0xff;
  const isPng =
    fileBuffer[0] === 0x89 &&
    fileBuffer[1] === 0x50 &&
    fileBuffer[2] === 0x4e &&
    fileBuffer[3] === 0x47;
  const isWebp =
    fileBuffer[0] === 0x52 &&
    fileBuffer[1] === 0x49 &&
    fileBuffer[2] === 0x46 &&
    fileBuffer[3] === 0x46;

    if (!isJpeg && !isPng && !isWebp) {
    throw new Error('File header validation failed. Uploaded file is corrupted or spoofed');
  }

  return true
};
