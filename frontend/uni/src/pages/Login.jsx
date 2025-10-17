import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { CreditCard, Lock, ArrowRight } from "lucide-react";
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
      setLoginError("cin and password are required");
      return false;
    }
    setLoginError("");
    return true;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError("");
    setLoginSuccess("");

    if (!validateForm()) 
      return;
    setIsLoading(true);

    try {

      const response = await fetch("http://127.0.0.1:8000/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cin_or_email: cin, password }),
      });
      const data = await response.json();

      if (response.ok) {
          setLoginSuccess("Login success");
      } else {
          setLoginError(data.detail || "invalid cin or password");
      }

    } catch (err) {
      console.error(err);
      setLoginError("errors pls try again");
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex">
     
      <div
        className="hidden lg:flex lg:w-1/2 text-white p-12 flex-col justify-between"
        style={{ backgroundColor: "#18539c" }}
      >
        <div>
          <div className="flex items-center gap-4 mb-10">
            <img src={isetLogo} alt="ISET Logo" className="h-20 w-auto object-contain" />
            <span className="text-3xl font-bold tracking-wide">University</span>
          </div>
          <h1 className="text-5xl font-bold mb-6">Welcome Back to University</h1>
          <p className="text-lg max-w-md">
            Sign in to access your dashboard, manage schedules, track attendance, and stay connected.
          </p>
        </div>
      </div>

     
      <div className="flex-1 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-6 flex items-center gap-3 justify-center">
            <img src={isetLogo} alt="ISET Logo" className="h-10 w-10 object-contain" />
            <span className="text-xl font-bold" style={{ color: "#18539c" }}>University</span>
          </div>

          <div className="bg-white p-8 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-2">Sign In</h2>
            <p className="text-sm text-gray-500 mb-6">Enter your credentials to access your account</p>

            
            {loginError && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-4">
                {loginError}
              </div>
            )}

           
            {loginSuccess && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded mb-4">
                {loginSuccess}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label htmlFor="cin" className="block mb-1 font-medium">CIN</label>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    id="cin"
                    placeholder="Enter CIN"
                    value={cin}
                    onChange={(e) => setCin(e.target.value)}
                    className="pl-10 w-full border rounded-md h-11 border-gray-300"
                    disabled={isLoading}
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block mb-1 font-medium">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="password"
                    id="password"
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 w-full border rounded-md h-11 border-gray-300"
                    disabled={isLoading}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full h-11 text-white rounded-md font-semibold flex items-center justify-center gap-2"
                style={{ backgroundColor: "#18539c" }}
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Signing In...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    Sign In <ArrowRight className="h-5 w-5" />
                  </span>
                )}
              </button>

              <p className="text-center text-sm text-gray-500 mt-4">
                Don’t have an account?{" "}
                <Link to="/signup" style={{ color: "#18539c" }} className="font-medium">
                  Create Account
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
