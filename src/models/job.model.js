import mongoose from "mongoose";

// Embedded Schema for Individual Image Details
const imageMediaSchema = new mongoose.Schema(
  {
    imageUrl: { type: String, required: true },
    fileId: { type: String, required: true },
  },
  { _id: false },
);

// Embedded Schema for Video Details
const videoMediaSchema = new mongoose.Schema(
  {
    videoUrl: { type: String, required: true },
    fileId: { type: String, required: true },
  },
  { _id: false },
);

const jobSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      required: true,
      enum: [
        "Plumber",
        "Electrician",
        "Carpenter",
        "Painter",
        "Mechanic",
        "Mason",
        "Cleaner",
        "Other",
      ],
    },
    otherSpecficTask: {
      type: String,
      index: true
    },
    worktitle: {
      type: String,
      //   required: [true, 'Job title is required'],
      trim: true,
    },
    workDescription: {
      type: String,
      //   required: [true, 'Job description is required'],
    },
    images: [imageMediaSchema],

    video: {
      type: videoMediaSchema,
      default: null,
    },
    address: {
      type: String,
    index: true
    },
    preferredDay: {
      type: String,
    },
    preferredTimeSlot: {
      type: String,
      enum: ['morning', 'afternoon','evening']
    },
    bugdet: {
      type: Number
    },
    fullname: {
      type: String,
      required: true
    },
    phone: {
      type: String,
      required: true
    },

    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    creatorRole: {
      type: String,
      enum: ["user", "worker"],
      required: true,
    },

  },
  { timestamps: true },
);

export default mongoose.model("Job", jobSchema);
