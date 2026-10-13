// import fsPromises from "fs/promises";
import fs from 'fs'
import imagekit from "../config/imagekit.js";
// import { validateImageFile } from "../utils/imageValidator.js";

export const uploadToImagekit = async (file, folder = "profile-picture", isVideo = false) => {
  if (!file?.path || !file.filename) {
    throw new Error("A valid uploaded file is required for ImageKit upload");
  }
  
  const filePath = file.path;

  try {
    // await validateImageFile(filePath, file.mimetype, file.size, isVideo);

    // const fileBuffer = await fsPromises.readFile(filePath);
    // const fileBase64 = `data:${file.mimetype};base64,${fileBuffer.toString('base64')}`;

    const uploadResponse = await imagekit.upload({
      file: fs.createReadStream(filePath),
      fileName: file.originalname,
      folder: folder,
      useUniqueFileName: true,
      tags: isVideo ? ['job-video'] : ['job-image'],
    });

    return {
      fileId: uploadResponse.fileId,
      url: uploadResponse.url,
      thumbnail: uploadResponse.thumbnailUrl || uploadResponse.url,
      // name: uploadResponse.name,
    };
  } catch (error) {
    const responseMetadata = error?.$ResponseMetadata;
    const statusCode = responseMetadata?.statusCode ?? error?.statusCode;
    const responseHeaders = responseMetadata?.headers ?? {};

    console.error("ImageKit upload failed", {
      statusCode,
      message: error?.message,
      help: error?.help,
      requestId:
        responseHeaders["x-request-id"] ??
        responseHeaders["X-Request-Id"] ??
        responseHeaders["x-amz-cf-id"],
      fileName: file.filename,
      mimeType: file.mimetype,
      fileSize: file.size,
      folder,
    });

    if (error instanceof Error) {
      throw error;
    }

    const message = error?.message || error?.help || "Unknown ImageKit upload error";
    const normalizedError = new Error(
      `ImageKit upload failed${statusCode ? ` (${statusCode})` : ""}: ${message}`,
    );
    normalizedError.name = "ImageKitUploadError";
    normalizedError.statusCode = statusCode;
    normalizedError.help = error?.help;
    throw normalizedError;
  } finally {
    try {
      await fsPromises.unlink(filePath);
      console.log(
        `[FS CLEANUP] Successfully deleted temporary file: ${filePath}`,
      );
    } catch (unlinkError) {
      if (unlinkError.code !== "ENOENT") {
        console.error(
          `[FS CLEANUP ERROR] Failed to delete file ${filePath}:`,
          unlinkError,
        );
      }
    }
  }
};


export const deleteFromImageKit = async (fileId) => {
  try {
    return await imagekit.deleteFile(fileId);
  } catch (error) {
    throw new Error(`ImageKit Delete Failed: ${error.message}`);
  }
};