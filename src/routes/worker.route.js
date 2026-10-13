import { Router } from "express"
import * as workerController from "../controllers/worker.controller.js"
import { uploadSingleImage } from "../middlewares/multer.middleware.js"

const workerRouter = Router()


// POST - /api/v1/worker/register
workerRouter.post("/register", uploadSingleImage, workerController.createWorker)

// POST - /api/v1/worker/login
workerRouter.post("/login", workerController.WorkerLogin)

// POST - /api/v1/worker/verfiy-otp
workerRouter.post("/verfiy-otp", workerController.verifyOTPWorker)

// GET - /api/v1/worker/get-me
workerRouter.get("/get-me", workerController.getMe)

// POST - /api/v1/worker/refresh-token
workerRouter.post("/refresh-token", workerController.refreshToken)

// POST - /api/v1/worker/logout
workerRouter.post("/logout", workerController.workerlogout)

// POST - /api/v1/worker/logout-all
workerRouter.post("/logout-all", workerController.logoutAll)


export default workerRouter