import crypto from "crypto";
import argon2 from "argon2";
import jwt from "jsonwebtoken";
import OTP from "../models/otp.model.js";
import User from "../models/user.model.js";
import RefreshToken from "../models/refreshToken.model.js";
import { sendSMS } from "../services/smsProvider.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import config from "../config/config.js";

const generate6DigitOTP = () => crypto.randomInt(1000, 9999).toString();

// helper function for AT,RT
const generateToken = (user) => {
  const accessToken = jwt.sign(
    { userId: user._id, phone: user.phone, role: user.role },
    config.JWT_SECRET,
    { expiresIn: "15m" },
  );

  const refreshToken = jwt.sign({ userId: user._id }, config.JWT_SECRET, {
    expiresIn: "30d",
  });

  return { accessToken, refreshToken };
};

// send otp
export async function sendOTP(req, res) {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.json(new ApiResponse(400, "Phone number is required"));
    }

    const rawOtp = generate6DigitOTP();
    console.log(rawOtp);
    
    const otpHash = await argon2.hash(rawOtp);

    // delete existing otp
    await OTP.deleteMany({ phone });

    // store hash otp
    await OTP.create({ phone, otpHash });

    await sendSMS(phone, rawOtp);

    return res.json(
      new ApiResponse(200, "OTP sent successfully. Valid for 5 minutes."),
    );
  } catch (error) {
    console.error("sendotp error:", error);
    return res.json(new ApiError(500, "failed otp send"));
  }
}

// verify otp
export async function verifyOTP(req, res) {
  try {
    const { phone, otp } = req.body;

    if (!phone || !otp) {
      return res.json(new ApiResponse(400, "Phone and OTP are required"));
    }

    //find active otp record in db
    const otpRecord = await OTP.findOne({ phone });
    if (!otpRecord) {
      return res.json(new ApiResponse(400, "OTP expired or not requested"));
    }

    //verfiy hased otp
    const isValid = await argon2.verify(otpRecord.otpHash, otp);
    if (!isValid) {
      return res.json(new ApiResponse(400, "Invalid OTP"));
    }

    // Immediately destroy the OTP to enforce single-use protection
    await OTP.deleteOne({ _id: otpRecord._id });

    //find or register 
    let user = await User.findOne({phone})
    if(!user){
        user = await User.create({
            phone,
            role: "user"
        })
    }

    // jwt AT, RT
    const { accessToken, refreshToken } = generateToken(user)

    // store RT in db
    const refreshTokenHash = await argon2.hash(refreshToken)
    await RefreshToken.create({
        userId: user._id,
        tokenHash: refreshTokenHash
    })

    res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        maxAge: 30 * 24 * 60 * 60 * 1000, 
    })

    const userDetails = {
        id: user._id,
        phone: user.phone,
        role: user.role,
        accessToken
    }

    return res.json(new ApiResponse(200, userDetails, "Login successful"))

  } catch (error) {
    console.error("verifyOTP error:", error)
    return res.json(new ApiError(500, "authentication failed"))
  }
}

export async function refreshAccessToken(req, res) {
    try {
        const refreshToken = req.cookies.refreshToken

        if(!refreshToken){
            return res.json(new ApiResponse(401, 'Refresh token missing. Please log in again.'))
        }

        const decoded = jwt.verify(refreshToken, config.JWT_SECRET)

        const userTokens = await RefreshToken.find({ userId: decoded.userId })
        let matchedTokenRecord = null
        for(const record of userTokens){
            const match = await argon2.verify(record.tokenHash, refreshToken)
            if(match){
                matchedTokenRecord = record
                break;
            }
        }
        if(!matchedTokenRecord){
            return res.json(new ApiResponse(403,'Invalid or revoked refresh token'))
        }

        const user = await User.findById(decoded.userId)
        if(!user){
            return res.json(new ApiResponse(404, "User not found"))
        }

        const accessToken = jwt.sign(
            { userId: user._id, phone: user.phone, role: user.role },
            config.JWT_SECRET,
            { expiresIn: '15m' }
        )

        return res.json(new ApiResponse(200, accessToken, "New accessToken generated"))
    } catch (error) {
        console.error('refreshAccessToken Error:', error)
        res.json(new ApiResponse(403, "Expired or invalid refresh token"))
    }
}

export async function logout(req, res) {
    try {
        const refreshToken = req.cookies.refreshToken
        if(refreshToken){
            const decoded = jwt.decode(refreshToken)
            if(decoded?.userId){
                await RefreshToken.deleteMany({ userId: decoded.userId })
            }
        }

        res.clearCookie('refreshToken')
        return res.json(new ApiResponse(200, 'Logged out successfully'))
    } catch (error) {
        res.json(new ApiError(500, "logout failed"))
    }
}