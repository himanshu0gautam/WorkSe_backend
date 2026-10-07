import mongoose, { Schema } from 'mongoose'

const workerSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, "username is required"]
    },
    mobileNo: {
        type: Number,
        required: [true, "mobile is required"],
        unique: [true, "mobil number must be unique"]
    }
},{timestamps: true})

const workerModel = mongoose.model("worker", workerSchema)

export default workerModel