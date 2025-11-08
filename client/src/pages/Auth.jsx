import React, { useState } from 'react';
import Button from '../components/common/Button';

const EyeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EyeOffIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

const Auth = () => {
  // Login state
  const [loginData, setLoginData] = useState({
    username: '',
    password: '',
    remember: false,
  });
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Register state
  const [registerData, setRegisterData] = useState({
    email: '',
    userType: 'customer',
  });

  const handleLoginChange = (e) => {
    const { name, value, type, checked } = e.target;
    setLoginData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleRegisterChange = (e) => {
    const { name, value } = e.target;
    setRegisterData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    console.log('Login:', loginData);
    // TODO: Implement login logic
  };

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    console.log('Register:', registerData);
    // TODO: Implement register logic
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
            <a href="/" className="text-primary hover:underline font-semibold transition-colors">
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
          <div className="bg-gradient-to-br from-blue-50/50 via-slate-50 to-blue-50/30 rounded-3xl p-8 md:p-10 shadow-xl border border-slate-100">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-800 mb-2 text-center">
              Login
            </h2>
            <div className="w-20 h-1 bg-slate-300 mx-auto mb-6 rounded-full"></div>

            <form onSubmit={handleLoginSubmit} className="space-y-5">
              {/* Username or Email */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Username or email address <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="username"
                  value={loginData.username}
                  onChange={handleLoginChange}
                  required
                  className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-300 text-sm"
                  placeholder="Enter your username or email"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showLoginPassword ? 'text' : 'password'}
                    name="password"
                    value={loginData.password}
                    onChange={handleLoginChange}
                    required
                    className="w-full px-4 py-2.5 pr-12 border-2 border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-300 text-sm"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showLoginPassword ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
              </div>

              {/* Remember Me & Submit */}
              <div className="flex items-center justify-between pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  className="px-6 py-2"
                >
                  Log in
                </Button>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="remember"
                    checked={loginData.remember}
                    onChange={handleLoginChange}
                    className="w-4 h-4 text-primary border-slate-300 rounded focus:ring-2 focus:ring-primary cursor-pointer"
                  />
                  <span className="text-sm text-slate-600">Remember me</span>
                </label>
              </div>

              {/* Lost Password */}
              <div className="text-center pt-2">
                <a href="/forgot-password" className="text-primary hover:text-[#019974] font-medium text-sm hover:underline transition-colors">
                  Lost your password?
                </a>
              </div>
            </form>
          </div>

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
                  A link to set a new password will be sent to your email address.
                </p>
              </div>

              {/* User Type Radio Buttons */}
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="radio"
                    name="userType"
                    value="customer"
                    checked={registerData.userType === 'customer'}
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
                    checked={registerData.userType === 'vendor'}
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
                Your personal data will be used to support your experience throughout this website, to manage access to your account, and for other purposes described in our{' '}
                <a href="/privacy-policy" className="text-primary hover:text-[#019974] font-medium hover:underline">
                  privacy policy
                </a>
                .
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  fullWidth
                >
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
