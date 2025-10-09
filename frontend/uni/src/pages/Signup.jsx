import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Mail, CreditCard, ArrowRight, CheckCircle2 } from "lucide-react";
import isetLogo from "../assets/iset.jpg";

export default function Signup() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [cin, setCin] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSignup = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("http://127.0.0.1:8000/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, cin }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log("Signup success:", data);
        alert("account activated");
        navigate("/login");
      } else {
        setError( "account creation failed");
      }
    } catch (err) {
      console.error(err);
      setError("errors pls try again");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <div
        className="hidden lg:flex lg:w-1/2 text-white p-12 flex-col justify-between"
        style={{ backgroundColor: "#18539c" }}
      >
        <div>
          <div className="flex items-center gap-4 mb-10">
            <img
              src={isetLogo}
              alt="ISET Logo"
              className="h-20 w-auto object-contain bg-white rounded-lg p-1"
            />
            <span className="text-3xl font-bold tracking-wide">University</span>
          </div>

          <h1 className="text-5xl font-bold mb-6">
            Welcome to Your University Platform
          </h1>
          <p className="text-lg max-w-md">
            Manage schedules, track attendance, manage courses, and stay connected.
          </p>
        </div>

              <div className="space-y-4">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="h-5 w-5 mt-1" />
          <div>
            <h3 className="font-semibold">Smart Scheduling</h3>
            <p className="text-sm">
              Manage your timetable, track absences, and schedule makeup classes.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <CheckCircle2 className="h-5 w-5 mt-1" />
          <div>
            <h3 className="font-semibold">Real-time Notifications</h3>
            <p className="text-sm">
              Get instant alerts for schedule changes and announcements.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <CheckCircle2 className="h-5 w-5 mt-1" />
          <div>
            <h3 className="font-semibold">Comprehensive Analytics</h3>
            <p className="text-sm">
              View detailed reports to track academic performance.
            </p>
          </div>
        </div>
      </div>

      </div>

      <div className="flex-1 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-6 flex items-center gap-3 justify-center">
            <img
              src={isetLogo}
              alt="ISET Logo"
              className="h-10 w-10 rounded-lg bg-white p-1 shadow"
            />
            <span className="text-xl font-bold" style={{ color: "#18539c" }}>
              University
            </span>
          </div>

          <div className="bg-white p-8 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-2">Create Account</h2>
            <p className="text-sm text-gray-500 mb-6">
              Enter your details to get started
            </p>

            <form onSubmit={handleSignup} className="space-y-4">
              <div>
                <label htmlFor="email" className="block mb-1 font-medium">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    id="email"
                    placeholder="student@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 w-full border rounded-md h-11 border-gray-300"
                    disabled={isLoading}
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="cin" className="block mb-1 font-medium">
                  CIN
                </label>
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

              {error && <p className="text-red-500 text-sm">{error}</p>}

              <button
                type="submit"
                className="w-full h-11 text-white rounded-md font-semibold flex items-center justify-center gap-2"
                style={{ backgroundColor: "#18539c" }}
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating Account...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    Create Account
                    <ArrowRight className="h-5 w-5" />
                  </span>
                )}
              </button>

              <p className="text-center text-sm text-gray-500 mt-4">
                Already have an account?{" "}
                <Link
                  to="/login"
                  style={{ color: "#18539c" }}
                  className="font-medium"
                >
                  Sign In
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
