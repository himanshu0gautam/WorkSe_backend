import mongoose from 'mongoose';

// Embedded Schema for Individual Image Details
const imageMediaSchema = new mongoose.Schema(
  {
    imageUrl: { type: String, required: true },
    fileId: { type: String, required: true },
  },
  { _id: false }
);

// Embedded Schema for Video Details
const videoMediaSchema = new mongoose.Schema(
  {
    videoUrl: { type: String, required: true },
    fileId: { type: String, required: true },
  },
  { _id: false }
);

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
    //   required: [true, 'Job title is required'],
      trim: true,
    },
    description: {
      type: String,
    //   required: [true, 'Job description is required'],
    },
    category: {
      type: String,
      required: true,
      enum: ['Plumber', 'Electrician', 'Carpenter', 'Painter', 'Mechanic', 'Mason', 'Cleaner', 'Other'],
    },
    // MongoDB Embedding for Multiple Images
    images: [imageMediaSchema],

    // MongoDB Embedding for Single Video (Optional)
    video: {
      type: videoMediaSchema,
      default: null,
    },

    // postedBy: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: 'User',
    //   required: true,
    // },
  },
  { timestamps: true }
);

export default mongoose.model('Job', jobSchema);