import Job from '../models/job.model.js'
import { uploadToImagekit } from '../services/cloudStorage.js'


export async function createJob(req, res) {
    try {
    const { title, description, category } = req.body;

    // if (!title || !description || !category) {
    //   return res.status(400).json({ success: false, message: 'Title, description, and category are required' });
    // }

    const files = req.files || {};
    const imageFiles = files.images || [];
    const videoFiles = files.video || [];

    // 1. Upload All Images to ImageKit Concurrently
    const imageUploadPromises = imageFiles.map((file) =>
      uploadToImagekit(file, '/job-images', false)
    );

    // 2. Upload Video to ImageKit (if provided)
    const videoUploadPromise = videoFiles.length > 0
      ? uploadToImagekit(videoFiles[0], '/job-videos', true)
      : Promise.resolve(null);

    // Execute uploads in parallel
    const [uploadedImages, uploadedVideo] = await Promise.all([
      Promise.all(imageUploadPromises),
      videoUploadPromise,
    ]);

    // 3. Format Embedded Document Array for Images
    const embeddedImages = uploadedImages.map((img) => ({
      imageUrl: img.url,
      fileId: img.fileId,
    }));

    // 4. Format Embedded Document Object for Video
    const embeddedVideo = uploadedVideo
      ? {
          videoUrl: uploadedVideo.url,
          fileId: uploadedVideo.fileId,
        }
      : null;

    // 5. Store in MongoDB
    const newJob = await Job.create({
      title,
      description,
      category,
      images: embeddedImages,
      video: embeddedVideo,
      postedBy: req.user.id, // Populated via authMiddleware
    });

    return res.status(201).json({
      success: true,
      message: 'Job created successfully',
      job: newJob,
    });
  } catch (error) {
    console.error('createNewJob Error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to create new job',
    });
  }
}