import React from "react";

import LoginForm from "../components/auth/LoginForm";
import RegisterForm from "../components/auth/RegisterForm";

const AuthPage = () => {
  return (
    <div className="min-h-screen bg-white">
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

      <div className="container mx-auto px-4 max-w-7xl py-20 -mt-16">
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <LoginForm />
          <RegisterForm />
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
