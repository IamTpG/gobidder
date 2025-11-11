import React, { useState } from "react";
import Button from "../components/common/Button";
import LoginSection from "../components/sections/LoginSection";

const Auth = () => {
  // TODO: Implement register section (in components/sections/RegisterSection) and Remove all register related code in this file
  const [registerData, setRegisterData] = useState({
    email: "",
    userType: "customer",
  });

  const handleRegisterChange = (e) => {
    const { name, value } = e.target;
    setRegisterData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section with Breadcrumb */}
      <div className="bg-gradient-to-br from-slate-50 via-primary/5 to-slate-50 py-20">
        <div className="container mx-auto px-4 max-w-7xl">
          <h1 className="text-5xl md:text-6xl font-bold text-slate-800 text-center mb-6">
            My Account
          </h1>
          <div className="flex items-center justify-center gap-2 text-sm">
            <a
              href="/"
              className="text-primary hover:underline font-semibold transition-colors"
            >
              Home
            </a>
            <span className="text-slate-400 font-bold">→</span>
            <span className="text-slate-600 font-medium">My Account</span>
          </div>
        </div>
      </div>

      {/* Login and Register Section */}
      <div className="container mx-auto px-4 max-w-7xl py-20 -mt-16">
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Login Form */}
          <LoginSection />

          {/* Register Form */}
          <div className="bg-gradient-to-br from-blue-50/50 via-slate-50 to-blue-50/30 rounded-3xl p-8 md:p-10 shadow-xl border border-slate-100">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-800 mb-2 text-center">
              Register
            </h2>
            <div className="w-20 h-1 bg-slate-300 mx-auto mb-6 rounded-full"></div>

            <form onSubmit={handleRegisterSubmit} className="space-y-5">
              {/* Email Address */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Email address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={registerData.email}
                  onChange={handleRegisterChange}
                  required
                  className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-300 text-sm"
                  placeholder="Enter your email address"
                />
                <p className="text-xs text-slate-500 mt-2">
                  A link to set a new password will be sent to your email
                  address.
                </p>
              </div>

              {/* User Type Radio Buttons */}
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="radio"
                    name="userType"
                    value="customer"
                    checked={registerData.userType === "customer"}
                    onChange={handleRegisterChange}
                    className="w-4 h-4 text-primary border-slate-300 focus:ring-2 focus:ring-primary cursor-pointer"
                  />
                  <span className="text-sm text-slate-700 group-hover:text-primary transition-colors">
                    I am a customer
                  </span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="radio"
                    name="userType"
                    value="vendor"
                    checked={registerData.userType === "vendor"}
                    onChange={handleRegisterChange}
                    className="w-4 h-4 text-primary border-slate-300 focus:ring-2 focus:ring-primary cursor-pointer"
                  />
                  <span className="text-sm text-slate-700 group-hover:text-primary transition-colors">
                    I am a vendor
                  </span>
                </label>
              </div>

              {/* Privacy Policy */}
              <div className="text-sm text-slate-600 leading-relaxed bg-white/50 p-4 rounded-lg border border-slate-200">
                Your personal data will be used to support your experience
                throughout this website, to manage access to your account, and
                for other purposes described in our{" "}
                <a
                  href="/privacy-policy"
                  className="text-primary hover:text-[#019974] font-medium hover:underline"
                >
                  privacy policy
                </a>
                .
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <Button type="submit" variant="primary" size="md" fullWidth>
                  Register
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
