import React, { useState, useEffect } from "react";
import isetLogo from "../assets/iset.jpg";
import { Camera, Mail, Lock, Phone, ArrowRight, User } from "lucide-react";

export default function EditProfile() {
  const [userId, setUserId] = useState(null);
  const [form, setForm] = useState({
    email: "",
    phone: "",
    password: "",
  });
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [msg, setMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const storedId = localStorage.getItem("userId");
    const storedEmail = localStorage.getItem("userEmail");
    const storedPhone = localStorage.getItem("userPhone");

    if (storedId) setUserId(storedId);
    setForm({
      email: storedEmail || "",
      phone: storedPhone || "",
      password: "",
    });

    handleSubmit();

  }, []);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleImageChange(e) {
    const f = e.target.files[0];
    if (!f) return;
    setImage(f);
    setPreview(URL.createObjectURL(f));
  }

  async function handleSubmit(e) {
    // e.preventDefault();
    // setIsLoading(true);
    // setMsg("");

    // if (!userId) {
    //   setMsg("⚠️ Aucun utilisateur connecté !");
    //   setIsLoading(false);
    //   return;
    // }

    // const formData = new FormData();
    // formData.append("email", form.email);
    // formData.append("telp", form.phone);
    // formData.append("motdepasse", form.password);
    // if (image) formData.append("image", image);

    try {
      const response = await fetch(`http://localhost:3003/edit-profile/1`, {
        method: "POST",
        body: {},
      });

      const text = await response.text();

      if (response.ok) {
        setMsg("✅ Profile updated successfully!");
        
        localStorage.setItem("userEmail", form.email);
        localStorage.setItem("userPhone", form.phone);
      } else {
        setMsg(`❌ Error: ${text}`);
      }
    } catch (error) {
      console.error(error);
      setMsg("⚠️ Error connecting to server");
    }

    setIsLoading(false);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 🌐 NAVBAR */}
      <nav
        className="flex items-center justify-between px-6 py-4 shadow-md bg-white"
        style={{ borderBottom: "2px solid #18539c" }}
      >
        <div className="flex items-center gap-3">
          <img
            src={isetLogo}
            alt="ISET Logo"
            className="h-10 w-10 rounded-lg bg-white p-1 border"
          />
          <span
            className="text-2xl font-bold tracking-wide"
            style={{ color: "#18539c" }}
          >
            University
          </span>
        </div>

        <div className="flex items-center gap-6 text-gray-700">
          <button className="hover:text-[#18539c] transition">Home</button>
          <button className="hover:text-[#18539c] transition">Dashboard</button>
          <button className="hover:text-[#18539c] transition">Courses</button>
          <button className="hover:text-[#18539c] transition">Logout</button>
          <User className="text-[#18539c]" />
        </div>
      </nav>

      {/* ✏️ PROFILE FORM */}
      <div className="flex justify-center items-center py-12">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-lg">
          <h2
            className="text-2xl font-bold mb-2 text-center"
            style={{ color: "#18539c" }}
          >
            Edit Profile
          </h2>
          <p className="text-sm text-gray-500 mb-6 text-center">
            Update your account details below
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block mb-1 font-medium">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  className="pl-10 w-full border rounded-md h-11 border-gray-300 focus:ring-2 focus:ring-[#18539c]"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block mb-1 font-medium">
                New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  className="pl-10 w-full border rounded-md h-11 border-gray-300 focus:ring-2 focus:ring-[#18539c]"
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="phone" className="block mb-1 font-medium">
                Phone
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  id="phone"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  className="pl-10 w-full border rounded-md h-11 border-gray-300 focus:ring-2 focus:ring-[#18539c]"
                  required
                />
              </div>
            </div>

            {/* Profile Picture */}
            <div>
              <label className="block mb-1 font-medium">Profile Picture</label>
              <div className="flex items-center gap-4">
                <div className="relative w-24 h-24 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center border">
                  {preview ? (
                    <img
                      src={preview}
                      alt="preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Camera className="text-gray-400 h-8 w-8" />
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="text-sm"
                />
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="w-full h-11 text-white rounded-md font-semibold flex items-center justify-center gap-2 mt-4"
              style={{ backgroundColor: "#18539c" }}
              disabled={isLoading}
            >
              {isLoading ? "Saving..." : "Save Changes"}{" "}
              {!isLoading && <ArrowRight className="h-5 w-5" />}
            </button>

            {msg && (
              <p
                className={`text-center mt-3 font-medium ${
                  msg.includes("✅") ? "text-green-600" : "text-red-600"
                }`}
              >
                {msg}
              </p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
