import fs from "fs";
import fsPromises from "fs/promises";
import imagekit from "../config/imagekit.js";
import { validateImageFile } from "../utils/imageValidator.js";

export const uploadToImagekit = async (file, folder = "/uploads") => {
  const filePath = file.path;

  try {
    await validateImageFile(filePath, file.mimetype, file.size);

    const fileStream = fs.createReadStream(filePath);

    const uploadResponse = await imagekit.upload({
      file: fileStream,
      fileName: file.filename,
      folder: folder,
      useUniqueFileName: true,
      tags: ["user-upload"],
    });

    return {
      fileId: uploadResponse.fileId,
      url: uploadResponse.url,
      thumbnail: uploadResponse.thumbnailUrl,
      name: uploadResponse.name,
    };
  } catch (error) {
    console.error("cloudstorage file upload error", error);
    throw error;
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
