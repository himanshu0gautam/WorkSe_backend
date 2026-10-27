import mongoose, { Schema } from "mongoose";

const workerSchema = new mongoose.Schema(
  {
    fullname: {
      type: String,
      required: [true, "username is required"],
    },
    whattappNo: {
      type: Number,
    },
    phone: {
      type: Number,
      required: [true, "phone is required"],
      unique: [true, "phone number must be unique"],
    },
    experience: {
      type: String,
      index: true,
    },
    age: {
      type: Number,
    },
    dob: {
      type: String,
    },
    tradeCategory: {
      type: String,
      required: [true, "category is required"],
      index: true,
    },
    jobTitle: {
      type: String,
    },
    jobDetails: {
      type: String,
    },
    address: {
      type: String,
      required: [true, "address is required"],
      index: true,
    },
    state: {
      type: String,
    },
    city: {
      type: String,
      index: true,
    },
    pincode: {
      type: Number,
    },
    serviceRadius: {
      type: String,
    },
    skill: {
      type: String,
      index: true,
    },
    bio: {
      type: String,
    },
    imageUrl: {
      type: String,
      default: "",
    },
    isVerfify: {
      type: Boolean,
      default: false,
    },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        default: [0, 0],
      },
    },
    ExactAddress: {
      type: String
    },
    role: { type: String, default: "worker" }
  },
  { timestamps: true },
);

workerSchema.index({ location: "2dsphere" })

const workerModel = mongoose.model("worker", workerSchema);

export default workerModel;
