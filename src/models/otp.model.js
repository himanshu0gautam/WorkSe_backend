import mongoose from "mongoose";

const otpSchema = new mongoose.Schema({
    phone:{
        type: String,
        required: true,
        index: true
    },
    otpHash: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 300
    }
})

const otpModel = mongoose.model("otp", otpSchema)

export default otpModel