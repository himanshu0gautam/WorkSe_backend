import { Router } from "express"
import * as workerController from "../controllers/worker.controller.js"
const workerRouter = Router()


// POST - /api/v1/worker/register
workerRouter.post("/register", workerController.createUser)

// POST - /api/v1/worker/login
workerRouter.post("/login", workerController.userLogin)

// GET - /api/v1/worker/get-me
workerRouter.get("/get-me", workerController.getMe)

// GET - /api/v1/worker/refresh-token
workerRouter.get("/refresh-token", workerController.refreshToken)

// GET - /api/v1/worker/logout
workerRouter.get("/logout", workerController.Userlogout)

// GET - /api/v1/worker/logout-all
workerRouter.get("/logout-all", workerController.logoutAll)


export default workerRouter