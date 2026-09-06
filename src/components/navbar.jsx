import React, { useState } from "react";
import { Link } from "react-router-dom";
import { TrendingUp } from "lucide-react";

function Navbar() {
    return (
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-slate-950/90 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
          <div className="h-20 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3">
            {/* Logo */}
            <div className="w-10 h-10 flex items-center justify-center">
                <img
                src="/src/assets/Logo.png"
                alt="PerformanceTrack Logo"
                className="w-10 h-10 object-contain"
                />
            </div>

            {/* Brand Name */}
            <div>
                <h1 className="font-bold text-lg leading-none">
                Performance<span className="text-blue-400">Track</span>
                </h1>

                <p className="text-[10px] text-slate-400 mt-1 tracking-wider uppercase">
                Employee Performance
                </p>
            </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              <a
                href="#features"
                className="text-sm text-slate-300 hover:text-white transition"
              >
                Features
              </a>

              <a
                href="#how-it-works"
                className="text-sm text-slate-300 hover:text-white transition"
              >
                How It Works
              </a>

              <a
                href="#analytics"
                className="text-sm text-slate-300 hover:text-white transition"
              >
                Analytics
              </a>

              <a
                href="#faq"
                className="text-sm text-slate-300 hover:text-white transition"
              >
                FAQ
              </a>
            </nav>

            {/* Desktop Buttons */}
            <div className="hidden md:flex items-center gap-3">
              <Link
                to="/login"
                className="px-5 py-2.5 text-sm font-medium text-slate-300 hover:text-white transition"
              >
                Login
              </Link>

              <Link
                to="/AdminRegister"
                className="px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 transition text-sm font-semibold shadow-lg shadow-blue-600/20"
              >
                Get Started
              </Link>
            </div>

          </div>          
        </div>
      </header>
    );
}

export default Navbar;