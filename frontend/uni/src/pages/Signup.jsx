import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Mail, CreditCard, ArrowRight, UserCircle } from "lucide-react";
import isetLogo from "../assets/iset.jpg";

export default function Signup() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [cin, setCin] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSignup = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("http://127.0.0.1:8000/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, cin }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log("Signup success:", data);
        setSuccess("Account created successfully!");
        setTimeout(() => {
          navigate("/login");
        }, 1000);
      } else {
        setError("Account creation failed");
      }
    } catch (err) {
      console.error(err);
      setError("An error occurred. Please try again");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel */}
      <div 
        className="hidden lg:flex lg:w-1/2 text-white p-12 flex-col justify-between relative overflow-hidden" 
        style={{ background: "linear-gradient(135deg, #18539c 0%, #0d3a6f 100%)" }}
      >
        {/* Decorative circles */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white opacity-5 rounded-full -mr-48 -mt-48"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white opacity-5 rounded-full -ml-48 -mb-48"></div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-16">
            <div className="relative">
              <div className="absolute inset-0 bg-white opacity-20 blur-xl rounded-full"></div>
              <img 
                src={isetLogo} 
                alt="ISET Logo" 
                className="h-20 w-auto object-contain relative z-10 drop-shadow-2xl" 
              />
            </div>
            <span className="text-3xl font-bold tracking-wide drop-shadow-lg">University</span>
          </div>

          <h1 className="text-5xl font-bold mb-6 leading-tight drop-shadow-md">
            Rejoignez votre plateforme universitaire
          </h1>
          <p className="text-lg max-w-md opacity-90 leading-relaxed">
            Créez votre compte pour accéder à votre tableau de bord, gérer vos emplois du temps, 
            suivre les présences et rester connecté avec votre parcours académique.
          </p>

          
        </div>
        
        <div className="relative z-10">
          <p className="text-sm opacity-75">© 2025 University. Tous droits réservés.</p>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gradient-to-br from-gray-50 via-blue-50 to-gray-50">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden mb-8 flex items-center gap-3 justify-center">
            <img 
              src={isetLogo} 
              alt="ISET Logo" 
              className="h-12 w-12 object-contain relative z-10" 
            />
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
              University
            </span>
          </div>

          {/* Signup Card */}
          <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 relative overflow-hidden">
            {/* Decorative gradient */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400 to-purple-500 opacity-10 rounded-full -mr-16 -mt-16"></div>
            
            <div className="relative mb-8">
              <div className="flex items-center gap-3 mb-4">
                <UserCircle className="w-8 h-8 text-blue-600" />
                <h2 className="text-3xl font-bold text-gray-800">Créer un compte</h2>
              </div>
              <p className="text-sm text-gray-500">
                Entrez vos informations pour commencer
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 text-red-800 px-4 py-3 rounded-lg mb-6 animate-shake">
                <div className="flex items-start gap-2">
                  <span className="text-lg">⚠️</span>
                  <div>
                    <strong className="font-semibold">Erreur</strong>
                    <p className="text-sm mt-1">{error}</p>
                  </div>
                </div>
              </div>
            )}
            
            {/* Success Message */}
            {success && (
              <div className="bg-green-50 border-l-4 border-green-500 text-green-800 px-4 py-3 rounded-lg mb-6 animate-fade-in">
                <div className="flex items-start gap-2">
                  <span className="text-lg">✅</span>
                  <div>
                    <strong className="font-semibold">Succès</strong>
                    <p className="text-sm mt-1">{success}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Signup Form */}
            <form onSubmit={handleSignup} className="space-y-5">
              {/* Email Input */}
              <div>
                <label 
                  htmlFor="email" 
                  className="block mb-2 font-semibold text-gray-700 text-sm"
                >
                  Adresse Email
                </label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                  <input
                    type="email"
                    id="email"
                    placeholder="etudiant@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-12 pr-4 w-full border-2 border-gray-200 rounded-xl h-12 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all duration-200 bg-gray-50 focus:bg-white"
                    disabled={isLoading}
                    required
                  />
                </div>
              </div>

              {/* CIN Input */}
              <div>
                <label 
                  htmlFor="cin" 
                  className="block mb-2 font-semibold text-gray-700 text-sm"
                >
                  CIN
                </label>
                <div className="relative group">
                  <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                  <input
                    type="text"
                    id="cin"
                    placeholder="Entrez votre CIN"
                    value={cin}
                    onChange={(e) => setCin(e.target.value)}
                    className="pl-12 pr-4 w-full border-2 border-gray-200 rounded-xl h-12 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all duration-200 bg-gray-50 focus:bg-white"
                    disabled={isLoading}
                    required
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full h-12 text-white rounded-xl font-semibold flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 mt-6"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Création en cours...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    Créer un compte <ArrowRight className="h-5 w-5" />
                  </span>
                )}
              </button>

              {/* Login Link */}
              <div className="pt-6 border-t border-gray-100 text-center">
                <p className="text-sm text-gray-600">
                  Vous avez déjà un compte ?{" "}
                  <Link 
                    to="/login" 
                    className="font-semibold text-blue-600 hover:text-blue-700 hover:underline transition-colors"
                  >
                    Se connecter
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