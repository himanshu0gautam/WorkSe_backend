import Job from "../models/job.model.js";
import { uploadToImagekit } from "../services/cloudStorage.js";

export async function createJob(req, res) {
  try {
    const {
      category,
      otherSpecficTask,
      worktitle,
      workDescription,
      address,
      preferredDay,
      preferredTimeSlot,
      bugdet,
      fullname,
      phone,
    } = req.body;

    const requiredField = { address, fullname, category, phone };
    for (const [key, value] of Object.entries(requiredField))
      if (!value) {
        return res
          .status(400)
          .json({ success: false, message: `${key} is required` });
      }

    const files = req.files || {};
    const imageFiles = files.images || [];
    const videoFiles = files.video || [];

    // 1. Upload All Images to ImageKit Concurrently
    const imageUploadPromises = imageFiles.map((file) =>
      uploadToImagekit(file, "/job-images", false),
    );

    // 2. Upload Video to ImageKit (if provided)
    const videoUploadPromise =
      videoFiles.length > 0
        ? uploadToImagekit(videoFiles[0], "/job-videos", true)
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
      category,
      otherSpecficTask,
      worktitle,
      workDescription,
      address,
      preferredDay,
      preferredTimeSlot,
      bugdet,
      fullname,
      phone,
      images: embeddedImages,
      video: embeddedVideo,
      postedBy: req.user.id,
      creatorRole: req.user.role,
    });

    return res.status(201).json({
      success: true,
      message: "Job created successfully",
      job: newJob,
    });
  } catch (error) {
    console.error("createNewJob Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to create new job",
    });
  }
}

export async function getJob(req, res) {
  try {
    const { category, address, search, page = 1, limit = 10 } = req.query;

    const query = {};

    if (category) {
      query.category = { $regex: category, $options: "i" };
    }

    if (address) {
      query.address = { $regex: address, $options: "i" };
    }

    if (search) {
      query.$or = [
        { worktitle: { $regex: search, $options: "i" } },
        { workDescription: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);

    const rawJobs = await Job.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean()

      const jobs = rawJobs.map(job => ({
        ...job,
        postedTime: getTimeAgo(job.createdAt)
      }))

    const totalJobs = await Job.countDocuments(query);

    return res.status(200).json({
      success: true,
      count: jobs.length,
      total: totalJobs,
      totalPages: Math.ceil(totalJobs / Number(limit)),
      currentPage: Number(page),
      jobs,
    });
  } catch (error) {
    console.error("getAllJobs Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch jobs",
    });
  }
}

export async function getJobById(req, res) {
  try {
    const { id } = req.params;
    const job = await Job.findById(id);

    if (!job) {
      return res.status(404).json({ success: false, message: "Job not found" });
    }

    return res.status(200).json({
      success: true,
      job,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}


// posted time helper function
function getTimeAgo(date) {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + " years ago";
  
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + " months ago";
  
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + " days ago";
  
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + " hours ago";
  
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + " minutes ago";
  
  return "Just now";
}
