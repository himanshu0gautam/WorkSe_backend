import mongoose from "mongoose";
import config from "./config.js";

async function connectDB() {
  // .then(console.log("database connect successfully"))
  // .catch(console.log("database connection error"))
  try {
    await mongoose.connect(config.MONGO_URI);
    console.log("database connect successfully");
  } catch (error) {
    console.log("database connection error", error);
  }
}

export default connectDB;
