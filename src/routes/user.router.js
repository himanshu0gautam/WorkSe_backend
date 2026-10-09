import { Router } from 'express'
import * as userController from "../controllers/user.controller.js"
import { authenticateToken, authorizeRoles } from "../middlewares/user.middleware.js"
import { validateRequest } from '../middlewares/validate.middleware.js'
import { sendOtpSchema, verifyOtpSchema } from '../utils/validators.js'
import * as rateLimiter from "../middlewares/rateLimiters.js"

const userRouter = Router()

// POST - /api/v1/user/send-otp
userRouter.post("/send-otp", rateLimiter.otpRequestLimiter, validateRequest(sendOtpSchema), userController.sendOTP)

// POST - /api/v1/user/verify-otp
userRouter.post("/verify-otp", rateLimiter.otpVerifyLimiter, validateRequest(verifyOtpSchema), userController.verifyOTP)

// POST - /api/v1/user/refresh-token
userRouter.post("refresh-token", rateLimiter.refreshTokenLimiter, userController.refreshAccessToken)

// POST - /api/v1/user/logout
userRouter.post("logout", userController.logout)

// GET - /api/v1/user/profile
userRouter.get("/profile", authenticateToken, (req, res) => {
    res.json({ success: true, user: req.user })
})


userRouter.get('/admin/dashboard', authenticateToken, authorizeRoles('admin'), (req, res) => {
  res.json({ success: true, message: 'Welcome to Admin Dashboard' });
});


export default userRouter