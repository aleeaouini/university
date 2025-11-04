import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { CreditCard, Lock, ArrowRight, Sparkles, Shield, Users } from "lucide-react";
import isetLogo from "../assets/iset.jpg";

export default function Login() {
  const navigate = useNavigate();
  const [cin, setCin] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [loginSuccess, setLoginSuccess] = useState("");

  const validateForm = () => {
    if (!cin || !password) {
      setLoginError("CIN and password are required");
      return false;
    }
    setLoginError("");
    return true;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError("");
    setLoginSuccess("");

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const response = await fetch("http://127.0.0.1:8000/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cin_or_email: cin, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setLoginSuccess("Login successful!");

        if (data.user) {
          localStorage.setItem("userId", data.user.id);
          localStorage.setItem("userEmail", data.user.email);
          localStorage.setItem("userPhone", data.user.phone || "");
          localStorage.setItem("userNom", data.user.nom);
          localStorage.setItem("userPrenom", data.user.prenom);
          localStorage.setItem("userImage", data.user.image || "");
        }

        localStorage.setItem("accessToken", data.access_token);

        setTimeout(() => {
          navigate("/editprofile");
        }, 1000);
      } else {
        setLoginError(data.detail || "Invalid CIN or password");
      }
    } catch (err) {
      console.error("Login error:", err);
      setLoginError("An error occurred. Please try again.");
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Enhanced */}
      <div
        className="hidden lg:flex lg:w-1/2 text-white p-12 flex-col justify-between relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #18539c 0%, #0d3a6f 100%)" }}
      >
        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white opacity-5 rounded-full -mr-48 -mt-48"></div>
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-white opacity-5 rounded-full -ml-36 -mb-36"></div>
        <div className="absolute top-1/2 right-10 w-2 h-32 bg-white opacity-10 rounded-full"></div>
        <div className="absolute top-1/3 right-24 w-2 h-20 bg-white opacity-10 rounded-full"></div>

        <div className="relative z-10">
          {/* Logo & Brand */}
          <div className="flex items-center gap-4 mb-16">
            <div className="relative">
              <div className="absolute inset-0 bg-white opacity-20 blur-xl rounded-full"></div>
              <img src={isetLogo} alt="ISET Logo" className="h-20 w-auto object-contain relative z-10 drop-shadow-2xl" />
            </div>
            <span className="text-3xl font-bold tracking-wide drop-shadow-lg">University</span>
          </div>

          {/* Welcome Message */}
          <div className="mb-12">
            <h1 className="text-5xl font-bold mb-6 leading-tight drop-shadow-md">
              Welcome Back to<br />University
            </h1>
            <p className="text-lg max-w-md opacity-90 leading-relaxed">
              Sign in to access your dashboard, manage schedules, track attendance, and stay connected with your academic journey.
            </p>
          </div>

        </div>

        {/* Footer */}
        <div className="relative z-10">
          <p className="text-sm opacity-75">© 2025 University. All rights reserved.</p>
        </div>
      </div>

      {/* Right Panel - Enhanced */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gradient-to-br from-gray-50 via-blue-50 to-gray-50">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden mb-8 flex items-center gap-3 justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-blue-600 opacity-20 blur-xl rounded-full"></div>
              <img src={isetLogo} alt="ISET Logo" className="h-12 w-12 object-contain relative z-10" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
              University
            </span>
          </div>

          {/* Login Card */}
          <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 relative overflow-hidden">
            {/* Decorative Elements */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500 opacity-5 rounded-full -mr-16 -mt-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-500 opacity-5 rounded-full -ml-12 -mb-12"></div>

            {/* Header */}
            <div className="relative mb-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-2">Sign In</h2>
              <p className="text-sm text-gray-500">Enter your credentials to access your account</p>
            </div>

            {/* Error Alert */}
            {loginError && (
              <div className="bg-red-50 border-l-4 border-red-500 text-red-800 px-4 py-3 rounded-lg mb-6 animate-pulse">
                <p className="text-sm font-medium">{loginError}</p>
              </div>
            )}

            {/* Success Alert */}
            {loginSuccess && (
              <div className="bg-green-50 border-l-4 border-green-500 text-green-800 px-4 py-3 rounded-lg mb-6">
                <p className="text-sm font-medium">{loginSuccess}</p>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleLogin} className="space-y-5">
              {/* CIN Input */}
              <div>
                <label htmlFor="cin" className="block mb-2 font-semibold text-gray-700 text-sm">
                  CIN Number
                </label>
                <div className="relative group">
                  <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors duration-200" />
                  <input
                    type="text"
                    id="cin"
                    placeholder="Enter your CIN"
                    value={cin}
                    onChange={(e) => setCin(e.target.value)}
                    className="pl-12 pr-4 w-full border-2 border-gray-200 rounded-xl h-12 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all duration-200 bg-gray-50 focus:bg-white"
                    disabled={isLoading}
                    required
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label htmlFor="password" className="block font-semibold text-gray-700 text-sm">
                    Password
                  </label>
                  
                </div>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors duration-200" />
                  <input
                    type="password"
                    id="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-12 pr-4 w-full border-2 border-gray-200 rounded-xl h-12 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all duration-200 bg-gray-50 focus:bg-white"
                    disabled={isLoading}
                    required
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full h-12 text-white rounded-xl font-semibold flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-500 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 mt-6"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Signing In...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    Sign In <ArrowRight className="h-5 w-5" />
                  </span>
                )}
              </button>

              {/* Sign Up Link */}
              <div className="pt-6 border-t border-gray-100">
                <p className="text-center text-sm text-gray-600">
                  Don't have an account?{" "}
                  <Link 
                    to="/signup" 
                    className="font-semibold text-blue-600 hover:text-blue-700 hover:underline transition-colors"
                  >
                    Create Account
                  </Link>
                </p>
              </div>
            </form>
          </div>

         
        </div>
      </div>
    </div>
  );
}