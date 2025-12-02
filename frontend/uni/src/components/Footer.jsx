import React from "react";
import { Mail, Phone, MapPin, Facebook, Twitter, Linkedin, Instagram, Youtube, ArrowUpRight } from "lucide-react";

export default function Footer() {
  const handleNavigation = (path) => {
    console.log(`Navigate to: ${path}`);
  };

  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative bg-gradient-to-br from-slate-50 to-blue-50/50 border-t border-slate-200">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">
          {/* Brand Section - Takes 2 columns */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center gap-3">
              <div 
                className="h-14 w-14 rounded-xl flex items-center justify-center text-white font-bold text-2xl shadow-lg"
                style={{ backgroundColor: "#18539c" }}
              >
                U
              </div>
              <div className="flex flex-col">
                <span 
                  className="font-bold text-2xl tracking-tight"
                  style={{ color: "#18539c" }}
                >
                  University
                </span>
                <span className="text-sm text-slate-500 font-medium">
                  Excellence in Education
                </span>
              </div>
            </div>
            
            <p className="text-slate-600 leading-relaxed max-w-md">
              Empowering institutions with cutting-edge management solutions. 
              Transform your workflow and boost productivity with our platform.
            </p>

            {/* Social Media */}
            <div className="flex gap-3">
              {[
                { icon: Facebook, href: "#", color: "hover:bg-blue-600" },
                { icon: Twitter, href: "#", color: "hover:bg-sky-500" },
                { icon: Linkedin, href: "#", color: "hover:bg-blue-700" },
                { icon: Instagram, href: "#", color: "hover:bg-pink-600" },
                { icon: Youtube, href: "#", color: "hover:bg-red-600" },
              ].map((social, idx) => {
                const Icon = social.icon;
                return (
                  <a
                    key={idx}
                    href={social.href}
                    className={`w-11 h-11 rounded-xl bg-white border-2 border-slate-200 flex items-center justify-center transition-all duration-300 hover:scale-110 hover:border-transparent text-slate-600 hover:text-white ${social.color} shadow-sm hover:shadow-lg`}
                  >
                    <Icon className="w-5 h-5" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="text-slate-900 font-bold text-lg mb-6">Company</h3>
            <ul className="space-y-3">
              {[
                { label: "About Us", path: "/about" },
                { label: "Careers", path: "/careers" },
                { label: "Press Kit", path: "/press" },
                { label: "Partners", path: "/partners" },
              ].map((link, idx) => (
                <li key={idx}>
                  <button
                    onClick={() => handleNavigation(link.path)}
                    className="text-slate-600 hover:text-blue-600 transition-colors duration-200 group flex items-center gap-2 font-medium"
                  >
                    <span>{link.label}</span>
                    <ArrowUpRight className="w-3 h-3 opacity-0 -translate-y-1 translate-x-1 group-hover:opacity-100 group-hover:translate-y-0 group-hover:translate-x-0 transition-all duration-200" />
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Product Links */}
          <div>
            <h3 className="text-slate-900 font-bold text-lg mb-6">Product</h3>
            <ul className="space-y-3">
              {[
                { label: "Features", path: "/features" },
                { label: "Pricing", path: "/pricing" },
                { label: "Integrations", path: "/integrations" },
                { label: "Updates", path: "/updates" },
              ].map((link, idx) => (
                <li key={idx}>
                  <button
                    onClick={() => handleNavigation(link.path)}
                    className="text-slate-600 hover:text-blue-600 transition-colors duration-200 group flex items-center gap-2 font-medium"
                  >
                    <span>{link.label}</span>
                    <ArrowUpRight className="w-3 h-3 opacity-0 -translate-y-1 translate-x-1 group-hover:opacity-100 group-hover:translate-y-0 group-hover:translate-x-0 transition-all duration-200" />
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h3 className="text-slate-900 font-bold text-lg mb-6">Support</h3>
            <ul className="space-y-3">
              {[
                { label: "Help Center", path: "/help" },
                { label: "Documentation", path: "/docs" },
                { label: "Contact Us", path: "/contact" },
                { label: "Status", path: "/status" },
              ].map((link, idx) => (
                <li key={idx}>
                  <button
                    onClick={() => handleNavigation(link.path)}
                    className="text-slate-600 hover:text-blue-600 transition-colors duration-200 group flex items-center gap-2 font-medium"
                  >
                    <span>{link.label}</span>
                    <ArrowUpRight className="w-3 h-3 opacity-0 -translate-y-1 translate-x-1 group-hover:opacity-100 group-hover:translate-y-0 group-hover:translate-x-0 transition-all duration-200" />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>


        {/* Bottom Bar */}
        <div className="border-t border-slate-200 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-slate-600 text-sm">
            © {currentYear} University. All rights reserved.
          </p>
          
          <div className="flex flex-wrap gap-6 text-sm">
            <button
              onClick={() => handleNavigation("/privacy")}
              className="text-slate-600 hover:text-blue-600 transition-colors font-medium"
            >
              Privacy
            </button>
            <button
              onClick={() => handleNavigation("/terms")}
              className="text-slate-600 hover:text-blue-600 transition-colors font-medium"
            >
              Terms
            </button>
            <button
              onClick={() => handleNavigation("/cookies")}
              className="text-slate-600 hover:text-blue-600 transition-colors font-medium"
            >
              Cookies
            </button>
            <button
              onClick={() => handleNavigation("/sitemap")}
              className="text-slate-600 hover:text-blue-600 transition-colors font-medium"
            >
              Sitemap
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}