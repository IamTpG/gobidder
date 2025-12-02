import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useLocation, useNavigate } from "react-router-dom";
import OtpVerificationForm from "../components/auth/OtpVerificationForm";

const OtpVerificationPage = () => {
  const { verifyOtp } = useAuth(); // Giả sử hàm này gọi API verify register
  const location = useLocation();
  const navigate = useNavigate();

  const email = location.state?.email || "";
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email) {
      setError("Email is missing. Please register again.");
      return;
    }
    if (!otp || otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP.");
      return;
    }

    setLoading(true);
    try {
      await verifyOtp({ email, otp });
      navigate("/auth"); // Login page
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "OTP verification failed.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 flex justify-center items-center">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-slate-800">Registration</h1>
          <div className="w-20 h-1 bg-slate-300 my-2 mx-auto mb-6 rounded-full"></div>
        </div>

        <OtpVerificationForm
          email={email}
          otp={otp}
          setOtp={setOtp}
          loading={loading}
          error={error}
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  );
};

export default OtpVerificationPage;
