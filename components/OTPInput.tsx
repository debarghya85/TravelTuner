"use client";

import { useState } from "react";
import { sendOTP, verifyOTP } from "../lib/auth";

export default function OTPInput() {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);

  const handleSendOTP = async () => {
    try {
      setLoading(true);
      await sendOTP(phone);
      setStep(2);
    } catch (err) {
      alert("Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    try {
      setLoading(true);
      const user = await verifyOTP(otp);

      console.log("Logged in user:", user);

      // optional redirect after login
      window.location.href = "/form";
    } catch (err) {
      alert("Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded-xl max-w-sm mx-auto mt-4 space-y-3 bg-white shadow">
      
      {step === 1 ? (
        <>
          <h2 className="font-semibold">Enter Phone Number</h2>

          <input
            className="border p-2 w-full rounded"
            placeholder="+91XXXXXXXXXX"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />

          <button
            onClick={handleSendOTP}
            className="bg-black text-white w-full p-2 rounded"
            disabled={loading}
          >
            {loading ? "Sending..." : "Send OTP"}
          </button>
        </>
      ) : (
        <>
          <h2 className="font-semibold">Enter OTP</h2>

          <input
            className="border p-2 w-full rounded"
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
          />

          <button
            onClick={handleVerifyOTP}
            className="bg-green-600 text-white w-full p-2 rounded"
            disabled={loading}
          >
            {loading ? "Verifying..." : "Verify OTP"}
          </button>
        </>
      )}
    </div>
  );
}