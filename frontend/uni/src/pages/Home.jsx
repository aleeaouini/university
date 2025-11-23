"use client"

import React from "react"
import { ArrowRight, CheckCircle, Users, Clock, BarChart3, Shield, Menu, X } from "lucide-react"
import isetLogo from "../assets/iset.jpg";
import { useNavigate } from "react-router-dom";


export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false)
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white">
      <style>{`
        @tailwind base;
        @tailwind components;
        @tailwind utilities;
      `}</style>

      {/* Header */}
      <header className="sticky top-0 z-50 bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center shadow-md">
                <img src={isetLogo} alt="ISET Logo" className="h-20 w-auto object-contain relative z-10 drop-shadow-2xl" />
              </div>
              <span className="font-bold text-xl text-slate-900">University</span>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-slate-600 hover:text-blue-600 font-medium transition-colors">
                Features
              </a>
              <a href="#benefits" className="text-slate-600 hover:text-blue-600 font-medium transition-colors">
                Benefits
              </a>
              <a href="#contact" className="text-slate-600 hover:text-blue-600 font-medium transition-colors">
                Contact
              </a>
            </nav>

            {/* Desktop Buttons */}
            <div className="hidden md:flex items-center gap-4">
              <button 
                onClick={() => navigate("/login")}
                className="px-6 py-2 text-slate-600 hover:text-blue-600 font-medium transition-colors"
              >
                Log In
              </button>
              <button
                onClick={() => navigate("/signup")}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors shadow-md"
              >
                Sign Up
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button className="md:hidden p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <nav className="md:hidden mt-4 pb-4 space-y-4 border-t pt-4">
              <a href="#features" className="block text-slate-600 hover:text-blue-600 font-medium">Features</a>
              <a href="#benefits" className="block text-slate-600 hover:text-blue-600 font-medium">Benefits</a>
              <a href="#contact" className="block text-slate-600 hover:text-blue-600 font-medium">Contact</a>

              <div className="flex gap-2 pt-4">
                <button 
                  onClick={() => navigate("/login")}
                  className="flex-1 px-4 py-2 text-slate-600 border border-slate-300 rounded-lg font-medium hover:bg-slate-50"
                >
                  Log In
                </button>
                <button 
                  onClick={() => navigate("/signup")}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
                >
                  Sign Up
                </button>
              </div>
            </nav>
          )}
        </div>
      </header>

      {/* ---------------------------------------------------------------- */}
      {/* HERO SECTION (Avec Background Image Ajouté) */}
      {/* ---------------------------------------------------------------- */}

      <section
  className="relative overflow-hidden"
  style={{
    backgroundImage: `url("/src/assets/bg-hero.jpg")`,
    backgroundSize: "cover",
    backgroundPosition: "center",
  }}
>
  <div className="absolute inset-0 pointer-events-none backdrop-blur-xs">
  {/* Dégradé vertical de blanc */}
  <div
    className="
      absolute inset-0
      bg-gradient-to-b
      from-white/100
      via-white/50
      via-white/40
      via-white/70
      to-white/100
    "
  />
</div>







        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32 relative">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-block mb-4 px-4 py-2 bg-blue-50 border border-blue-200 rounded-full">
                <span className="text-blue-600 font-semibold text-sm">Simplified Management</span>
              </div>

              <h1 className="text-5xl md:text-6xl font-bold text-slate-900 leading-tight mb-6">
                Manage your staff with <span className="text-blue-600">ease</span>
              </h1>

              <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                A complete job and attendance management platform designed for modern academic institutions. 
                Simplify your administrative processes and save valuable time.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => navigate("/login")}
                  className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors shadow-lg"
                >
                  Get Started <ArrowRight size={20} />
                </button>

                <button className="flex items-center justify-center gap-2 border-2 border-slate-300 hover:border-blue-600 text-slate-700 hover:text-blue-600 font-semibold py-3 px-8 rounded-lg transition-colors bg-white">
                  View Demo
                </button>
              </div>
            </div>

            <div className="hidden md:flex justify-center">
              <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl p-12 shadow-2xl w-full max-w-md h-80 flex flex-col items-center justify-center text-white relative overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute top-10 left-10 w-20 h-20 bg-white rounded-full"></div>
                  <div className="absolute bottom-10 right-10 w-32 h-32 bg-white rounded-full"></div>
                </div>
                <div className="relative z-10 text-center">
                  <div className="w-24 h-24 mx-auto mb-4 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
                    <Users size={48} />
                  </div>
                  <p className="text-xl font-semibold">Intuitive Management</p>
                  <p className="text-blue-100 mt-2">Complete and simple dashboard</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* RESTE DU CODE – inchangé */}
      {/* ---------------------------------------------------------------- */}

      {/* Features Section */}
      <section id="features" className="py-20 md:py-32 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">Main Features</h2>
            <p className="text-xl text-slate-600">Everything you need to manage your team effectively</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: Users,
                title: "Employee Management",
                description: "Easily manage your staff with detailed profiles, roles, and permissions.",
              },
              {
                icon: Clock,
                title: "Attendance Tracking",
                description: "Track arrival and departure times in real time with detailed reports.",
              },
              {
                icon: BarChart3,
                title: "Analytics & Reports",
                description: "Get deep insights on attendance trends and productivity.",
              },
              {
                icon: Shield,
                title: "Robust Security",
                description: "Your data is protected with encryption and secure authentication.",
              },
            ].map((feature, idx) => {
              const Icon = feature.icon
              return (
                <div
                  key={idx}
                  className="bg-white rounded-xl p-8 border border-slate-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300 group cursor-pointer"
                >
                  <div className="w-12 h-12 bg-blue-100 group-hover:bg-blue-600 rounded-lg flex items-center justify-center mb-4 transition-colors">
                    <Icon className="w-6 h-6 text-blue-600 group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-3">{feature.title}</h3>
                  <p className="text-slate-600 leading-relaxed text-sm">{feature.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section id="benefits" className="py-20 md:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">Why Choose Us</h2>
            <p className="text-xl text-slate-600">Optimize your administrative management and boost your productivity</p>
          </div>

          <div className="grid md:grid-cols-3 gap-10">
            {[
              { title: "Save Time", description: "Automate repetitive administrative tasks and save several hours per week." },
              { title: "Reduce Errors", description: "Minimize manual errors with our automatic validation system." },
              { title: "24/7 Access", description: "Access your data and reports anytime, from anywhere." },
              { title: "Dedicated Support", description: "Our support team is always available to assist and guide you." },
              { title: "Easy Integrations", description: "Integrate easily with your existing systems without complications." },
              { title: "Compliance Guaranteed", description: "Stay compliant with legal standards and industry best practices." },
            ].map((benefit, idx) => (
              <div key={idx} className="flex gap-4">
                <CheckCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold text-slate-900 mb-2">{benefit.title}</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">{benefit.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20 md:py-32 bg-gradient-to-r from-blue-600 to-blue-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            {[
              { number: "500+", label: "Active Institutions" },
              { number: "50K+", label: "Satisfied Users" },
              { number: "99.9%", label: "Guaranteed Uptime" },
              { number: "24/7", label: "Customer Support" },
            ].map((stat, idx) => (
              <div key={idx}>
                <div className="text-4xl md:text-5xl font-bold text-white mb-2">{stat.number}</div>
                <div className="text-blue-100 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="contact" className="py-20 md:py-32 bg-slate-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">Ready to Transform Your Management?</h2>
          <p className="text-xl text-slate-600 mb-10">Join hundreds of institutions already trusting our platform</p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate("/signup")}
              className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors shadow-lg"
            >
              Create a Free Account
            </button>

            <button className="px-8 py-3 border-2 border-slate-300 hover:border-blue-600 text-slate-700 hover:text-blue-600 font-semibold rounded-lg transition-colors bg-white">
              Contact Support
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <img src={isetLogo} alt="ISET Logo" className="h-20 w-auto object-contain relative z-10 drop-shadow-2xl" />
                </div>
                <span className="font-bold text-white">University</span>
              </div>
              <p className="text-sm leading-relaxed">
                A complete job and attendance management platform for academic institutions.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-white mb-4">Product</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Security</a></li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-white mb-4">Company</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-white mb-4">Legal</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Cookies</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center text-sm">
            <p>&copy; 2025 University. All rights reserved.</p>

            <div className="flex gap-6 mt-4 md:mt-0">
              <a href="#" className="hover:text-white transition-colors">Twitter</a>
              <a href="#" className="hover:text-white transition-colors">LinkedIn</a>
              <a href="#" className="hover:text-white transition-colors">GitHub</a>
            </div>
          </div>
        </div>
      </footer>

    </div>
  )
}
