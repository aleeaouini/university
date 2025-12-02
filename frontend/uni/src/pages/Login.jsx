import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { CreditCard, Lock, ArrowRight, UserCircle } from "lucide-react";
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
      setLoginError("CIN/Email et mot de passe sont requis");
      return false;
    }
    setLoginError("");
    return true;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setLoginError("");
    setLoginSuccess("");

    try {
      console.log("🔐 Attempting login...");
      
      const response = await fetch("http://127.0.0.1:8000/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cin_or_email: cin, password }),
      });

      const data = await response.json();
      console.log("📥 Login response:", data);

      if (response.ok) {
        // Store user data
        if (data.user) {
          localStorage.setItem("userId", data.user.id);
          localStorage.setItem("userEmail", data.user.email);
          localStorage.setItem("userPhone", data.user.phone || "");
          localStorage.setItem("userNom", data.user.nom || "");
          localStorage.setItem("userPrenom", data.user.prenom || "");
          localStorage.setItem("userImage", data.user.image || "");
        }

        // Store JWT and roles
        localStorage.setItem("jwt", data.access_token);
        localStorage.setItem("userRoles", JSON.stringify(data.roles || []));

        // 🎯 ROLE-BASED REDIRECT
        const roles = data.roles || [];
        console.log("👤 User roles:", roles);

        let redirectPath = "/";
        let welcomeMessage = "Connexion réussie!";

        // Priority order: administratif > enseignant > etudiant
        if (roles.includes("administratif")) {
          redirectPath = "/adminDashboard";
          welcomeMessage = "Bienvenue Administrateur!";
          console.log("🔀 Redirecting to Admin Dashboard");
        } else if (roles.includes("chef")) {
          redirectPath = "/chefDashboard";
          welcomeMessage = "Bienvenue Chef de Département!";
          console.log("🔀 Redirecting to Chef Dashboard");
        } else if (roles.includes("enseignant")) {
          redirectPath = "/teacherDashboard";
          welcomeMessage = "Bienvenue Enseignant!";
          console.log("🔀 Redirecting to Teacher Dashboard");
        } else if (roles.includes("etudiant")) {
          redirectPath = "/studentDashboard";
          welcomeMessage = "Bienvenue Étudiant!";
          console.log("🔀 Redirecting to Student Dashboard");
        } else {
          setLoginError("Rôle non reconnu. Veuillez contacter l'administration.");
          setIsLoading(false);
          console.error("❌ Unknown role:", roles);
          return;
        }

        setLoginSuccess(welcomeMessage);

        // Redirect after showing success message
        setTimeout(() => {
          console.log("✅ Navigating to:", redirectPath);
          navigate(redirectPath);
        }, 1000);
      } else {
        console.error("❌ Login failed:", data.detail);
        setLoginError(data.detail || "CIN/Email ou mot de passe invalide");
      }
    } catch (err) {
      console.error("❌ Login error:", err);
      setLoginError("Une erreur s'est produite. Veuillez réessayer.");
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
            Bienvenue sur votre plateforme universitaire
          </h1>
          <p className="text-lg max-w-md opacity-90 leading-relaxed">
            Connectez-vous pour accéder à votre tableau de bord, gérer vos emplois du temps, 
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

          {/* Login Card */}
          <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 relative overflow-hidden">
            {/* Decorative gradient */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400 to-purple-500 opacity-10 rounded-full -mr-16 -mt-16"></div>
            
            <div className="relative mb-8">
              <div className="flex items-center gap-3 mb-4">
                <UserCircle className="w-8 h-8 text-blue-600" />
                <h2 className="text-3xl font-bold text-gray-800">Connexion</h2>
              </div>
              <p className="text-sm text-gray-500">
                Entrez vos identifiants pour accéder à votre compte
              </p>
            </div>

            {/* Error Message */}
            {loginError && (
              <div className="bg-red-50 border-l-4 border-red-500 text-red-800 px-4 py-3 rounded-lg mb-6 animate-shake">
                <div className="flex items-start gap-2">
                  <span className="text-lg">⚠️</span>
                  <div>
                    <strong className="font-semibold">Erreur</strong>
                    <p className="text-sm mt-1">{loginError}</p>
                  </div>
                </div>
              </div>
            )}
            
            {/* Success Message */}
            {loginSuccess && (
              <div className="bg-green-50 border-l-4 border-green-500 text-green-800 px-4 py-3 rounded-lg mb-6 animate-fade-in">
                <div className="flex items-start gap-2">
                  <span className="text-lg">✅</span>
                  <div>
                    <strong className="font-semibold">Succès</strong>
                    <p className="text-sm mt-1">{loginSuccess}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleLogin} className="space-y-5">
              {/* CIN/Email Input */}
              <div>
                <label 
                  htmlFor="cin" 
                  className="block mb-2 font-semibold text-gray-700 text-sm"
                >
                  CIN ou Email
                </label>
                <div className="relative group">
                  <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                  <input
                    type="text"
                    id="cin"
                    placeholder="Entrez votre CIN ou Email"
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
                <label 
                  htmlFor="password" 
                  className="block mb-2 font-semibold text-gray-700 text-sm"
                >
                  Mot de passe
                </label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                  <input
                    type="password"
                    id="password"
                    placeholder="Entrez votre mot de passe"
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
                className="w-full h-12 text-white rounded-xl font-semibold flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 mt-6"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Connexion en cours...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    Se connecter <ArrowRight className="h-5 w-5" />
                  </span>
                )}
              </button>

              {/* Signup Link */}
              <div className="pt-6 border-t border-gray-100 text-center">
                <p className="text-sm text-gray-600">
                  Vous n'avez pas de compte ?{" "}
                  <Link 
                    to="/signup" 
                    className="font-semibold text-blue-600 hover:text-blue-700 hover:underline transition-colors"
                  >
                    Créer un compte
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