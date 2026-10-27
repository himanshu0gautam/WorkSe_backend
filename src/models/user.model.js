import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    phone: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    username: {
      type: String,
      // required: [true, "username is required"]
    },
    role: {
      type: String,
      enum: ["user", "worker", "admin"],
      default: "user",
    },
    isVerified: {
      type: Boolean,
      default: true,
    },
    address: {
      type: String,
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
  },
  { timestamps: true },
);

userSchema.index({ location: "2dsphere" });

const userModel = mongoose.model("User", userSchema);

export default userModel;
