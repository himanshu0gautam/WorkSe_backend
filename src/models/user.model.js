import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    phone: {
      type: String,
      required: true,
      unique: true,
      index: true 
    },
    role: {
      type: String,
      enum: ['user', 'worker', 'admin'],
      default: 'user'
    },
    isVerified: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

const userModel = mongoose.model('User', userSchema);

export default userModel