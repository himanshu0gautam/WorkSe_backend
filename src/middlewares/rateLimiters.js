import rateLimit from "express-rate-limit";

// ----------------------------------------------------
// 1. Strict OTP Request Rate Limiter (Prevents SMS Bombing)
// Max 3 OTP requests per 10 minutes per IP
// ----------------------------------------------------
export const otpRequestLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message:
      "Too many OTP requests from this IP. Please try again after 10 minutes.",
  },
});


// ----------------------------------------------------
// 2. Strict OTP Verification Rate Limiter (Prevents Brute Force)
// Max 5 invalid verification attempts per 10 minutes
// ----------------------------------------------------
export const otpVerifyLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 5, // Max 5 verification attempts per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message:
      "Too many verification attempts. Please try again after 10 minutes.",
  },
});


// ----------------------------------------------------
// 3. Refresh Token Rate Limiter
// Max 5 refresh attempts per 15 minutes
// ----------------------------------------------------
export const refreshTokenLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many token refresh attempts. Please try again later.',
  },
});



// auth limiter
export const userAuthLimiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 5,
    message: { success: false, message: 'Too many login attempts. Try again later.' }
})




// ----------------------------------------------------
// 4. Global API Rate Limiter (General DDoS Protection)
// Max 100 requests per 15 minutes for all general routes
// ----------------------------------------------------
// export const globalApiLimiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 500, // Limit each IP to 100 requests per 15 minutes
//   standardHeaders: true,
//   legacyHeaders: false,
//   message: {
//     success: false,
//     message: 'Too many requests from this IP. Please try again in 15 minutes.',
//   },
// });
