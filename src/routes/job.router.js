import { Router } from "express";
import * as jobController from '../controllers/job.controller.js'
import { uploadJobMedia } from "../middlewares/multer.middleware.js";
import { authenticateToken } from "../middlewares/user.middleware.js";

const jobRouter = Router()

// POST - /api/v1/user/job/createNew
jobRouter.post("/createNew",authenticateToken, uploadJobMedia, jobController.createJob)



export default jobRouter