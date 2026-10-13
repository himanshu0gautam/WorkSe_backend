import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import workerModel from "../models/worker.model.js";
import sessionModel from "../models/workerSession.model.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import argon2 from "argon2";
import config from "../config/config.js";
import { uploadToImagekit } from "../services/cloudStorage.js";
import OTP from "../models/otp.model.js";
import { sendSMS } from "../services/smsProvider.js";

const generate4DigitOTP = () => crypto.randomInt(1000, 9999).toString();

const generateToken = (worker) => {
  const accessToken = jwt.sign(
    { id: worker._id, phone: worker.phone },
    config.JWT_SECRET,
    { expiresIn: "15m" },
  );

  const refreshToken = jwt.sign({ id: worker._id }, config.JWT_SECRET, {
    expiresIn: "30d",
  });

  return { accessToken, refreshToken };
};

export async function createWorker(req, res) {
  const {
    fullname,
    phone,
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

  if (
    !fullname ||
    !phone ||
    !experience ||
    !tradeCategory ||
    !address ||
    !state ||
    !city ||
    !skill
  ) {
    return res.json(new ApiResponse(400, "fullname"));
  }

  if (!req.file) {
    return res
      .status(400)
      .json(
        new ApiResponse(
          400,
          "Please upload a profile image using the 'image' field",
        ),
      );
  }

  const isAllready = await workerModel.findOne({
    $or: [{ phone }],
  });

  if (isAllready) {
    return res.json(
      new ApiResponse(409, "this user phone number is already exist"),
    );
  }

  const uploadResult = await uploadToImagekit(req.file, "profile-picture");

  const user = await workerModel.create({
    fullname,
    phone,
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
    phoneNo: user.phone,
    token: accessToken,
  };

  res.json(new ApiResponse(201, userData, "user register successfully"));
}

export async function WorkerLogin(req, res) {
  const { fullname, phone } = req.body;

  if (!phone) {
    return res.json(new ApiResponse(400, "phone number is required"));
  }

  const worker = await workerModel.findOne({ phone });

  if (!worker) {
    return res.json(new ApiResponse(401, "invalid fullname and phone number"));
  }

  const rawotp = generate4DigitOTP();
  console.log(rawotp);

  const otpHash = await argon2.hash(rawotp);

  await OTP.deleteMany({ phone });

  await OTP.create({ phone, fullname, otpHash });

  await sendSMS(phone, rawotp);

  // const hashedPassword = crypto
  //   .createHash("sha256")
  //   .update(password)
  //   .digest("hex");

  // const isPasswordValid = hashedPassword === user.password;

  // if (isPasswordValid) {
  //   return res.json(new ApiResponse(401, "invalid mobile number"));
  // }

  // const refreshToken = jwt.sign(
  //   {
  //     id: user._id,
  //   },
  //   config.JWT_SECRET,
  //   {
  //     expiresIn: "15d",
  //   },
  // );

  // const refreshTokenHash = crypto
  //   .createHash("sha256")
  //   .update(refreshToken)
  //   .digest("hex");

  // const session = await sessionModel.create({
  //   user: user._id,
  //   refreshTokenHash,
  //   ip: req.ip,
  //   userAgent: req.headers["user-agent"],
  // });

  // const accessToken = jwt.sign(
  //   {
  //     id: user._id,
  //     sessionId: session._id,
  //   },
  //   config.JWT_SECRET,
  //   {
  //     expiresIn: "15m",
  //   },
  // );

  // res.cookies("refreshToken", refreshToken, {
  //   httpOnly: true,
  //   secure: true,
  //   sameSite: "strict",
  //   maxAge: 15 * 24 * 60 * 60 * 1000,
  // });

  // const userDetails = {
  //   username: user.fullname,
  //   mobileNo: user.mobileNo,
  //   accessToken,
  // };

  return res.json(
    new ApiResponse(200, "OTP sent successfully. Valid for 5 minutes."),
  );
}

export async function verifyOTPWorker(req, res) {
  try {
    const { phone, otp } = req.body;

    if (!phone || !otp) {
      return res.json(new ApiResponse(400, "Phone and OTP are required"));
    }

    const otpRecord = await OTP.findOne({ phone });
    if (!otpRecord) {
      return res.json(new ApiResponse(400, "OTP expired or not requested"));
    }

    const isValidotp = await argon2.verify(otpRecord.otpHash, otp);
    if (!isValidotp) {
      return res.json(new ApiResponse(400, "Invalid OTP"));
    }

    const worker = await workerModel.findOne({ phone });
    if (!worker) {
      return res.json(new ApiResponse(404, "Worker not found"));
    }

    await OTP.deleteOne({ _id: otpRecord._id });

    worker.isVerfify = true;
    await worker.save();

    const { accessToken, refreshToken } = generateToken(worker);

    const refreshTokenHash = crypto
      .createHash("sha256")
      .update(refreshToken)
      .digest("hex");

    const session = await sessionModel.create({
      user: worker._id,
      refreshTokenHash,
      ip: req.ip,
      userAgent: req.headers["user-agent"],
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    const workerDetails = {
      id: worker._id,
      fullname: worker.fullname,
      category: worker.tradeCategory,
      state: worker.state,
      pincode: worker.pincode,
      phone: worker.phone,
      role: "worker",
      accessToken,
    };

        return res.json(new ApiResponse(200, workerDetails, "Worker Login successful"))

  } catch (error) {
        console.error("verifyOTP error:", error)
        return res.json(new ApiResponse(500, "OTP verfiy error"))
  }
}

export async function getMe(req, res) {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.json(new ApiResponse(401, "user token not found"));
  }

  const decoded = jwt.verify(token, config.JWT_SECRET);

  const user = await workerModel.findById(decoded.id);

  const userDetails = {
    username: user.fullname,
    phoneNo: user.phone,
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

export async function workerlogout(req, res) {
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
