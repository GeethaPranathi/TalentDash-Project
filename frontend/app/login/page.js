"use client";

import { useState } from "react";
import Cookies from "js-cookie";
import { toast } from 'react-hot-toast';
import { API_URL } from "../../utils/config";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    // VALIDATION
    if (!email || !password) {
      toast.error("Please enter email and password");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();

      // LOGIN SUCCESS
      if (data.token) {
        localStorage.setItem("token", data.token);
        Cookies.set("token", data.token);
        toast.success("Login Successful");

        // DECODE JWT
        const payload = JSON.parse(atob(data.token.split(".")[1]));

        // ROLE BASED REDIRECT
        if (payload.role === "admin") {
          window.location.href = "/admin";
        } else if (payload.role === "recruiter") {
          window.location.href = "/recruiter";
        } else {
          window.location.href = "/";
        }
      } else {
        toast.error(data.error || "Invalid Credentials");
      }
    } catch (err) {
      toast.error("Login Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-background text-foreground p-6 transition-colors duration-200">
      <div className="bg-card p-10 rounded-3xl shadow-lg border border-border w-full max-w-md">
        <h1 className="text-3xl font-bold mb-8 text-center text-foreground">
          TalentDash Login
        </h1>

        {/* EMAIL */}
        <input
          type="email"
          placeholder="Email"
          className="w-full bg-background border border-border text-foreground p-4 rounded-xl mb-4 outline-none focus:ring-2 focus:ring-accent transition-all"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        {/* PASSWORD */}
        <input
          type="password"
          placeholder="Password"
          autoComplete="current-password"
          className="w-full bg-background border border-border text-foreground p-4 rounded-xl mb-6 outline-none focus:ring-2 focus:ring-accent transition-all"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {/* LOGIN BUTTON */}
        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full bg-accent text-accent-foreground font-semibold p-4 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        {/* REGISTER */}
        <p className="mt-8 text-center text-muted-foreground text-sm">
          Don't have an account?
          <a href="/register" className="text-accent font-semibold ml-2 hover:underline">
            Register
          </a>
        </p>
      </div>
    </div>
  );
}
