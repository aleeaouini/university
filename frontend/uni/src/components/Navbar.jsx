import React from "react";
import { Menu, X, Home, Phone, FileSpreadsheet, LogIn, UserPlus } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Navbar() {
  const [open, setOpen] = React.useState(false);

  const navigate = useNavigate();
  const handleNavigation = (path) => {
    navigate(path);         
    setOpen(false);         
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md shadow-sm border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo Section */}
          <div 
            className="flex items-center gap-3 cursor-pointer group" 
            onClick={() => handleNavigation("/home")}
          >
            <div className="relative">
              <div className="absolute inset-0 bg-[#18539c] rounded-xl blur-lg opacity-0 group-hover:opacity-40 transition-all duration-500"></div>
              <div 
                className="relative h-14 w-14 rounded-xl flex items-center justify-center text-white font-bold text-2xl shadow-lg overflow-hidden transition-transform duration-300 group-hover:scale-105"
                style={{ backgroundColor: "#18539c" }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <span className="relative z-10">U</span>
              </div>
            </div>
            <div className="flex flex-col">
              <span 
                className="font-bold text-2xl tracking-tight transition-colors duration-300"
                style={{ color: "#18539c" }}
              >
                University
              </span>
              <span className="text-xs text-slate-500 font-medium tracking-wide">
                Excellence in Education
              </span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-2">
            <button 
              onClick={() => handleNavigation("/home")}
              className="group px-4 py-2.5 text-slate-700 hover:text-[#18539c] rounded-lg font-medium transition-all duration-200 flex items-center gap-2 hover:bg-blue-50"
            >
              <Home size={18} className="transition-transform group-hover:scale-110" />
              <span>Home</span>
            </button>
            <button 
              onClick={() => handleNavigation("/contact")}
              className="group px-4 py-2.5 text-slate-700 hover:text-[#18539c] rounded-lg font-medium transition-all duration-200 flex items-center gap-2 hover:bg-blue-50"
            >
              <Phone size={18} className="transition-transform group-hover:scale-110" />
              <span>Contact</span>
            </button>
            <button 
              onClick={() => handleNavigation("/csv")}
              className="group px-4 py-2.5 text-slate-700 hover:text-[#18539c] rounded-lg font-medium transition-all duration-200 flex items-center gap-2 hover:bg-blue-50"
            >
              <FileSpreadsheet size={18} className="transition-transform group-hover:scale-110" />
              <span>CSV Tools</span>
            </button>
            <button 
              onClick={() => handleNavigation("/ListChef")}
              className="group px-4 py-2.5 text-slate-700 hover:text-[#18539c] rounded-lg font-medium transition-all duration-200 flex items-center gap-2 hover:bg-blue-50"
            >
              <FileSpreadsheet size={18} className="transition-transform group-hover:scale-110" />
              <span>List chef</span>
            </button>

          </nav>

          {/* Desktop Action Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <button 
              onClick={() => handleNavigation("/login")}
              className="group px-5 py-2.5 text-slate-700 hover:text-[#18539c] font-medium transition-all duration-200 rounded-lg hover:bg-slate-100 flex items-center gap-2"
            >
              <LogIn size={18} className="transition-transform group-hover:-translate-x-0.5" />
              <span>Log In</span>
            </button>
            <button 
              onClick={() => handleNavigation("/signup")}
              className="group relative px-6 py-2.5 text-white font-semibold rounded-xl overflow-hidden shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5 flex items-center gap-2"
              style={{ backgroundColor: "#18539c" }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
              <UserPlus size={18} className="relative z-10 transition-transform group-hover:scale-110" />
              <span className="relative z-10">Sign Up</span>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden p-2.5 rounded-lg hover:bg-slate-100 transition-all duration-200 active:scale-95" 
            onClick={() => setOpen(!open)}
          >
            {open ? (
              <X size={24} className="text-slate-700" />
            ) : (
              <Menu size={24} className="text-slate-700" />
            )}
          </button>
        </div>

        {/* Mobile Navigation Menu */}
        <div 
          className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
            open ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <nav className="py-4 space-y-1 border-t border-slate-200">
            <button
              onClick={() => handleNavigation("/home")}
              className="w-full flex items-center gap-3 px-4 py-3.5 text-slate-700 hover:text-[#18539c] hover:bg-blue-50 rounded-lg font-medium transition-all duration-200"
            >
              <Home size={20} />
              <span>Home</span>
            </button>
            <button 
              onClick={() => handleNavigation("/contact")}
              className="w-full flex items-center gap-3 px-4 py-3.5 text-slate-700 hover:text-[#18539c] hover:bg-blue-50 rounded-lg font-medium transition-all duration-200"
            >
              <Phone size={20} />
              <span>Contact</span>
            </button>
            <button 
              onClick={() => handleNavigation("/csv")}
              className="w-full flex items-center gap-3 px-4 py-3.5 text-slate-700 hover:text-[#18539c] hover:bg-blue-50 rounded-lg font-medium transition-all duration-200"
            >
              <FileSpreadsheet size={20} />
              <span>CSV Tools</span>
            </button>

            {/* Mobile Action Buttons */}
            <div className="flex flex-col gap-2.5 pt-4 px-2">
              <button 
                onClick={() => handleNavigation("/login")}
                className="w-full flex items-center justify-center gap-2 px-4 py-3.5 text-slate-700 border-2 border-slate-200 hover:border-[#18539c] hover:text-[#18539c] rounded-xl font-semibold transition-all duration-200"
              >
                <LogIn size={20} />
                <span>Log In</span>
              </button>
              <button 
                onClick={() => handleNavigation("/signup")}
                className="w-full flex items-center justify-center gap-2 px-4 py-3.5 text-white rounded-xl font-semibold shadow-lg transition-all duration-200 hover:shadow-xl active:scale-95"
                style={{ backgroundColor: "#18539c" }}
              >
                <UserPlus size={20} />
                <span>Sign Up</span>
              </button>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}