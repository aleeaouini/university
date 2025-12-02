import { useState, useEffect } from "react";
import { Lock, Phone, Mail, Upload, User, Menu, X, Calendar, CheckCircle, XCircle, Settings, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import isetLogo from "../assets/iset.jpg";
import axios from "axios";

export default function EditProfile() {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  // Prefill from localStorage
  const initialId = localStorage.getItem("userId") || "";
  const initialEmail = localStorage.getItem("userEmail") || "";
  const initialTelp = localStorage.getItem("userPhone") || "";

  const [id, setId] = useState(initialId);
  const [email, setEmail] = useState(initialEmail);
  const [telp, setTelp] = useState(initialTelp);
  const [motdepasse, setMotdepasse] = useState("");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!id) {
      setMessage("User ID missing! Please log in first.");
    }
  }, [id]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!id) return;

    const formData = new FormData();
    if (email) formData.append("email", email);
    if (motdepasse) formData.append("motdepasse", motdepasse);
    if (telp) formData.append("telp", telp);
    if (image) formData.append("image", image);

    setIsLoading(true);
    setMessage("");

    try {
      const token = localStorage.getItem("accessToken");
      if (!token) throw new Error("Missing authentication token");

      const res = await axios.post(
        `http://localhost:3003/edit-profile/${id}`,
        formData,
        { headers: { 
            "Content-Type": "multipart/form-data",
            "Authorization": `Bearer ${token}`
          } 
        }
      );

      setMessage(res.data?.message || "Profile updated successfully");

      // Update localStorage if email or phone changed
      if (email) localStorage.setItem("userEmail", email);
      if (telp) localStorage.setItem("userPhone", telp);
      if (res.data?.image) localStorage.setItem("userImage", res.data.image);

      setTimeout(() => navigate("/"), 1500);
    } catch (err) {
      console.error("Update failed:", err);
      setMessage(err.response?.data?.detail || err.message || "Server error");
    }

    setIsLoading(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("userId");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userPhone");
    localStorage.removeItem("userImage");
    navigate("/login");
  };

  const handleNavigation = (path) => {
    navigate(path);
    setMobileMenuOpen(false);
    setProfileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo/Brand */}
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center gap-2">
                <div className="bg-blue-600 p-2 rounded-lg">
                  <User className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-900">EduTrack</span>
              </div>
              
              {/* Desktop Navigation */}
              <div className="hidden md:ml-8 md:flex md:space-x-1">
                <button
                  onClick={() => handleNavigation("/dashboard")}
                  className="px-4 py-2 rounded-lg font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors flex items-center gap-2"
                >
                  <Calendar className="w-4 h-4" />
                  Emploi du temps
                </button>
                <button
                  onClick={() => handleNavigation("/dashboard?tab=absences")}
                  className="px-4 py-2 rounded-lg font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors flex items-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  Absences
                </button>
              </div>
            </div>

            {/* Right side - Profile menu and mobile menu button */}
            <div className="flex items-center gap-4">
              {/* Current Page Indicator */}
              <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
                <User className="w-4 h-4" />
                Modifier le profil
              </div>

              {/* Profile Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-blue-600" />
                  </div>
                  <span className="hidden sm:block text-sm font-medium text-gray-700">Mon Profil</span>
                  <Settings className="w-4 h-4 text-gray-500" />
                </button>

                {profileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                    <button
                      onClick={() => handleNavigation("/edit-profile")}
                      className="w-full text-left px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 flex items-center gap-2 bg-blue-50"
                    >
                      <User className="w-4 h-4" />
                      Modifier le profil
                    </button>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4" />
                      Déconnexion
                    </button>
                  </div>
                )}
              </div>

              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                {mobileMenuOpen ? (
                  <X className="w-5 h-5 text-gray-600" />
                ) : (
                  <Menu className="w-5 h-5 text-gray-600" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t border-gray-200 py-2">
              <div className="flex flex-col space-y-1">
                <button
                  onClick={() => handleNavigation("/dashboard")}
                  className="px-4 py-3 rounded-lg font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors flex items-center gap-3"
                >
                  <Calendar className="w-5 h-5" />
                  Emploi du temps
                </button>
                <button
                  onClick={() => handleNavigation("/dashboard?tab=absences")}
                  className="px-4 py-3 rounded-lg font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors flex items-center gap-3"
                >
                  <CheckCircle className="w-5 h-5" />
                  Absences
                </button>
                <button
                  onClick={() => handleNavigation("/edit-profile")}
                  className="px-4 py-3 rounded-lg font-medium text-blue-600 bg-blue-50 flex items-center gap-3"
                >
                  <User className="w-5 h-5" />
                  Modifier le profil
                </button>
                <button
                  onClick={handleLogout}
                  className="px-4 py-3 rounded-lg font-medium text-red-600 hover:bg-red-50 transition-colors flex items-center gap-3"
                >
                  <LogOut className="w-5 h-5" />
                  Déconnexion
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex bg-gradient-to-br from-blue-50 via-white to-blue-50">
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="w-full max-w-md">
            {/* Logo Header */}
            <div className="lg:hidden mb-8 flex items-center gap-3 justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-blue-600 opacity-20 blur-xl rounded-full"></div>
                <img src={isetLogo} alt="ISET Logo" className="h-12 w-12 object-contain relative z-10" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                University
              </span>
            </div>

            {/* Main Card */}
            <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 relative overflow-hidden">
              {/* Decorative Elements */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500 opacity-5 rounded-full -mr-16 -mt-16"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-500 opacity-5 rounded-full -ml-12 -mb-12"></div>

              {/* Header */}
              <div className="relative mb-8">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <User className="w-6 h-6 text-blue-600" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-800">Edit Profile</h2>
                </div>
                <p className="text-sm text-gray-500 ml-14">Update your account information</p>
              </div>

              {/* Message Alert */}
              {message && (
                <div
                  className={`px-4 py-3 mb-6 rounded-lg border-l-4 ${
                    message.toLowerCase().includes("success")
                      ? "bg-green-50 border-green-500 text-green-800"
                      : "bg-red-50 border-red-500 text-red-800"
                  }`}
                >
                  <p className="text-sm font-medium">{message}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Profile Image Upload */}
                <div>
                  <label className="block mb-2 font-semibold text-gray-700 text-sm">
                    Profile Image
                  </label>
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center overflow-hidden border-4 border-white shadow-md">
                        {imagePreview ? (
                          <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                        ) : (
                          <User className="w-10 h-10 text-blue-600" />
                        )}
                      </div>
                    </div>
                    <label
                      htmlFor="image"
                      className="flex-1 cursor-pointer bg-gray-50 hover:bg-gray-100 border-2 border-dashed border-gray-300 hover:border-blue-400 rounded-xl p-4 transition-all duration-200"
                    >
                      <div className="flex items-center gap-3">
                        <Upload className="w-5 h-5 text-gray-500" />
                        <div>
                          <p className="text-sm font-medium text-gray-700">
                            {image ? image.name : "Choose a file"}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">PNG, JPG up to 5MB</p>
                        </div>
                      </div>
                      <input
                        type="file"
                        id="image"
                        onChange={handleImageChange}
                        className="hidden"
                        disabled={isLoading}
                        accept="image/*"
                      />
                    </label>
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className="block mb-2 font-semibold text-gray-700 text-sm">
                    Email Address
                  </label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors duration-200" />
                    <input
                      type="email"
                      id="email"
                      placeholder="your.email@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-12 pr-4 w-full border-2 border-gray-200 rounded-xl h-12 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all duration-200 bg-gray-50 focus:bg-white"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label htmlFor="motdepasse" className="block mb-2 font-semibold text-gray-700 text-sm">
                    New Password
                  </label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors duration-200" />
                    <input
                      type="password"
                      id="motdepasse"
                      placeholder="Enter new password"
                      value={motdepasse}
                      onChange={(e) => setMotdepasse(e.target.value)}
                      className="pl-12 pr-4 w-full border-2 border-gray-200 rounded-xl h-12 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all duration-200 bg-gray-50 focus:bg-white"
                      disabled={isLoading}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1.5 ml-1">Leave blank to keep current password</p>
                </div>

                {/* Phone */}
                <div>
                  <label htmlFor="telp" className="block mb-2 font-semibold text-gray-700 text-sm">
                    Phone Number
                  </label>
                  <div className="relative group">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors duration-200" />
                    <input
                      type="text"
                      id="telp"
                      placeholder="+216 12 345 678"
                      value={telp}
                      onChange={(e) => setTelp(e.target.value)}
                      className="pl-12 pr-4 w-full border-2 border-gray-200 rounded-xl h-12 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all duration-200 bg-gray-50 focus:bg-white"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="w-full h-12 text-white rounded-xl font-semibold flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-500 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 mt-8"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Updating...</span>
                    </>
                  ) : (
                    "Update Profile"
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Close dropdown when clicking outside */}
      {(profileMenuOpen || mobileMenuOpen) && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => {
            setProfileMenuOpen(false);
            setMobileMenuOpen(false);
          }}
        />
      )}
    </div>
  );
}