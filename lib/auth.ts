
import { auth } from "../lib/firebase";
import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
} from "firebase/auth";

let confirmationResult: ConfirmationResult | null = null;

/**
 * STEP 1: Send OTP
 */
export const sendOTP = async (phone: string) => {
  const appVerifier = new RecaptchaVerifier(
    auth,
    "recaptcha-container",
    {
      size: "invisible",
    }
  );

  confirmationResult = await signInWithPhoneNumber(
    auth,
    phone,
    appVerifier
  );

  return true;
};

/**
 * STEP 2: Verify OTP
 */
export const verifyOTP = async (otp: string) => {
  if (!confirmationResult) {
    throw new Error("OTP not sent yet");
  }

  const result = await confirmationResult.confirm(otp);

  return result.user;
};