import { Router } from "express";
import * as jobController from '../controllers/job.controller.js'
import { uploadJobMedia } from "../middlewares/multer.middleware.js";
import { authenticateToken, authorizeRoles } from "../middlewares/user.middleware.js";

const jobRouter = Router()

// POST - /api/v1/job/createNew
jobRouter.post("/createNew",authenticateToken,authorizeRoles('user','worker'), uploadJobMedia, jobController.createJob)

// GET - /api/v1/job/allWork
jobRouter.get("/allWork", uploadJobMedia, jobController.getJob)

// GET - /api/v1/job/:id
jobRouter.get("/:id", jobController.getJobById)


export default jobRouter