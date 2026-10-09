import { z } from "zod";

// remove +91, 0, hyphens, space
export const sanitizePhoneNo = (phone) => {
  if (typeof phone !== "string") return "";

  let cleaned = phone.replace(/\D/g, "");

  if (cleaned.length === 12 && cleaned.startsWith("91")) {
    cleaned = cleaned.slice(2);
  } else if (cleaned.length === 11 && cleaned.startsWith("0")) {
    cleaned = cleaned.slice(1);
  }

  return cleaned;
};

// rule must be 10digit, contain(0-9), start with 6,7,8,9, remove dummy repating no
export const phoneSchema = z
  .string({ required_error: "Phone number is required" })
  .trim()
  .transform(sanitizePhoneNo)
  .refine((val) => val.length === 10, {
    message: "Phone number must be exactly 10 digits",
  })
  .refine((val) => /^[6-9]\d{9}$/.test(val), {
    message:
      "Please enter a valid Indian mobile number starting with 6, 7, 8, or 9",
  })
  .refine((val) => !/^(\d)\1{9}$/.test(val), {
    message:
      "Invalid phone number (cannot be 10 repeating digits like 0000000000)",
  });

// otp rule
export const otpSchema = z
  .string({ required_error: "OTP is required" })
  .trim()
  .refine((val) => /^\d{4}$/.test(val), {
    message: "OTP must be a 4-digit numeric code",
  });


export const sendOtpSchema = z.object({
    phone: phoneSchema
})

export const verifyOtpSchema = z.object({
    phone: phoneSchema,
    otp: otpSchema
})