import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import workerModel from "../models/worker.model.js";
import sessionModel from "../models/workerSession.model.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import config from "../config/config.js";
import { uploadToImagekit } from "../services/cloudStorage.js";

export async function createUser(req, res) {
  const { 
    fullname,
    mobileNo,
    whattappNo,
    experience,
    age,
    dob,
    tradeCategory,
    jobTitle,
    jobDetails,
    address,
    state,
    city,
    pincode,
    serviceRadius,
    skill,
    bio,
    } = req.body;

  if (!fullname || !mobileNo || !experience || !tradeCategory || !address || !state || !city || !skill) {
    return res.json(new ApiResponse(400, "fullname"))
  }

  if (!req.file) {
    return res.json(new ApiResponse(400, "please upload profile image"));
  }

  const isAllready = await workerModel.findOne({
    $or: [{ mobileNo }],
  });

  if (isAllready) {
    return res.json(new ApiResponse(409, "this user mobile number is already exist"));
  }

  const uploadResult = await uploadToImagekit(req.file, "/profile-picture");

  const user = await workerModel.create({
    fullname,
    mobileNo,
    whattappNo,
    experience,
    age,
    dob,
    tradeCategory,
    jobTitle,
    jobDetails,
    address,
    state,
    city,
    pincode,
    serviceRadius,
    skill,
    bio,
    imageUrl: uploadResult.url,
  });

  const refreshToken = jwt.sign(
    {
      id: user._id,
    },
    config.JWT_SECRET,
    {
      expiresIn: "15d",
    },
  );

  const refreshTokenHash = crypto
    .createHash("sha256")
    .update(refreshToken)
    .digest("hex");
  const session = await sessionModel.create({
    user: user._id,
    refreshTokenHash,
    ip: req.ip,
    userAgent: req.headers["user-agent"],
  });

  const accessToken = jwt.sign(
    {
      id: user._id,
      sessionId: session._id,
    },
    config.JWT_SECRET,
    {
      expiresIn: "15m",
    },
  );

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    maxAge: 15 * 24 * 60 * 60 * 1000,
  });

  const userData = {
    user: user.fullname,
    mobileNo: user.mobileNo,
    token: accessToken,
  };

  res.json(new ApiResponse(201, userData, "user register successfully"));
}

export async function userLogin(req, res) {
  const { fullname, mobileNo } = req.body;

  const user = await workerModel.findOne({ mobileNo });

  if (!user) {
    return res.json(new ApiResponse(401, "invalid fullname and mobile number"));
  }

  const hashedPassword = crypto
    .createHash("sha256")
    .update(password)
    .digest("hex");

  const isPasswordValid = hashedPassword === user.password;

  if (isPasswordValid) {
    return res.json(new ApiResponse(401, "invalid mobile number"));
  }

  const refreshToken = jwt.sign(
    {
      id: user._id,
    },
    config.JWT_SECRET,
    {
      expiresIn: "15d",
    },
  );

  const refreshTokenHash = crypto
    .createHash("sha256")
    .update(refreshToken)
    .digest("hex");

  const session = await sessionModel.create({
    user: user._id,
    refreshTokenHash,
    ip: req.ip,
    userAgent: req.headers["user-agent"],
  });

  const accessToken = jwt.sign(
    {
      id: user._id,
      sessionId: session._id,
    },
    config.JWT_SECRET,
    {
      expiresIn: "15m",
    },
  );

  res.cookies("refreshToken", refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    maxAge: 15 * 24 * 60 * 60 * 1000
  })

  const userDetails = {
    username: user.fullname,
    mobileNo: user.mobileNo,
    accessToken
  }

  res.json(new ApiResponse(200, userDetails, "User logged In successfully"))
}

export async function getMe(req, res) {
  const token = req.headers.authorization?.split(" "[1]);

  if (!token) {
    return res.json(new ApiResponse(401, "user token not found"));
  }

  const decoded = jwt.verify(token, config.JWT_SECRET);

  const user = await workerModel.findById(decoded.id);

  const userDetails = {
    username: user.fullname,
    mobileNo: user.mobileNo,
  };

  res.json(new ApiResponse(200, userDetails, "user fetched successfully"));
}

export async function refreshToken(req, res) {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return res.json(
      new ApiResponse(401, "user logout Refresh token not found"),
    );
  }

  const decoded = jwt.verify(refreshToken, config.JWT_SECRET);

  const refreshTokenHash = crypto
    .createHash("sha256")
    .update(refreshToken)
    .digest("hex");

  const session = await sessionModel.findOne({
    refreshTokenHash,
    revoke: false,
  });

  if (!session) {
    return res.json(new ApiResponse(401, "invalid refresh token"));
  }

  const accessToken = jwt.sign(
    {
      id: decoded.id,
    },
    config.JWT_SECRET,
    {
      expiresIn: "15m",
    },
  );

  const newRefreshToken = jwt.sign(
    {
      id: decoded.id,
    },
    config.JWT_SECRET,
    {
      expiresIn: "15d",
    },
  );

  const newRefreshTokenHash = crypto
    .createHash("sha256")
    .update(newRefreshToken)
    .digest("hex");

  session.refreshTokenHash = newRefreshTokenHash;
  await session.save();

  res.cookies("refreshToken", newRefreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    maxAge: 15 * 24 * 60 * 60 * 1000,
  });

  res.json(
    new ApiResponse(200, accessToken, "Access token refreshed successfully"),
  );
}

export async function Userlogout(req, res) {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return res.json(new ApiResponse(400, "Refresh token not found"));
  }

  const refreshTokenHash = crypto
    .createHash("sha256")
    .update(refreshToken)
    .digest("hex");

  const session = await sessionModel.findOne({
    refreshTokenHash,
    revoke: false,
  });

  if (!session) {
    return res.json(new ApiResponse(400, "invalid refresh token"));
  }

  session.revoke = true;
  await session.save();

  res.clearCookie("refreshToken");

  res.json(new ApiResponse(200, "logged out sucessfully"));
}

export async function logoutAll(req, res) {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return res.json(
      new ApiResponse(401, "User Logout Refresh token not found"),
    );
  }

  const decoded = jwt.verify(refreshToken, config.JWT_SECRET);

  await sessionModel.updateMany(
    {
      user: decoded.id,
      revoke: false,
    },
    {
      revoke: true,
    },
  );

  res.clearCookie("refreshToken");

  res.json(new ApiResponse(200, "Logged out from all devices successfully"));
}
