import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import Button from "../components/common/Button";
import Spinner from "../components/common/Spinner";
import { useLocation, useNavigate } from "react-router-dom";

const OtpVerification = () => {
  const { verifyOtp } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const email = location.state?.email || ""; // Lấy email từ location.state
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => setOtp(e.target.value);

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
      alert("OTP verified successfully!");
      navigate("/auth"); // chuyển về trang login sau khi xác thực thành công
    } catch (err) {
      if (err.response?.data?.message) setError(err.response.data.message);
      else setError(err.message || "OTP verification failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-blue-50/50 via-slate-50 to-blue-50/30 rounded-3xl p-8 md:p-10 shadow-xl border border-slate-100 max-w-md mx-auto mt-10">
      <h2 className="text-2xl md:text-3xl font-bold text-slate-800 mb-2 text-center">
        OTP Verification
      </h2>
      <div className="w-20 h-1 bg-slate-300 mx-auto mb-6 rounded-full"></div>

      <p className="text-sm text-slate-700 mb-4 text-center">
        Enter the 6-digit OTP sent to <span className="font-medium">{email}</span>
      </p>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            OTP *
          </label>
          <input
            type="text"
            name="otp"
            value={otp}
            onChange={handleChange}
            required
            placeholder="Enter OTP"
            maxLength={6}
            className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-300 text-sm text-center tracking-widest"
          />
        </div>

        {error && (
          <div className="p-3 text-sm text-red-700 bg-red-100 border border-red-200 rounded-lg">
            {error}
          </div>
        )}

        <div className="pt-2">
          <Button type="submit" variant="primary" size="md" fullWidth disabled={loading}>
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <Spinner size="sm" className="text-white" />
                Verifying...
              </div>
            ) : (
              "Verify OTP"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default OtpVerification;
