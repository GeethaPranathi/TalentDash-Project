"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from 'react-hot-toast';

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please enter email and password");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("http://localhost:5000/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role })
      });
      const data = await res.json();

      if (res.ok) {
        toast.success("Account created! Please login.");
        router.push("/login");
      } else {
        toast.error(data.error || "Registration Failed");
      }
    } catch (err) {
      toast.error("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-background text-foreground p-6 transition-colors duration-200">
      <div className="bg-card p-10 rounded-3xl shadow-lg border border-border w-full max-w-md">
        <h1 className="text-3xl font-bold mb-8 text-center text-foreground">
          Create Account
        </h1>

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-muted-foreground">Email Address</label>
            <input
              type="email"
              placeholder="name@company.com"
              className="w-full bg-background border border-border text-foreground p-4 rounded-xl outline-none focus:ring-2 focus:ring-accent transition-all"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-muted-foreground">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full bg-background border border-border text-foreground p-4 rounded-xl outline-none focus:ring-2 focus:ring-accent transition-all"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-muted-foreground">I am a...</label>
            <select
              className="w-full bg-background border border-border text-foreground p-4 rounded-xl outline-none focus:ring-2 focus:ring-accent transition-all"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="user">Individual (Viewing Salaries)</option>
              <option value="recruiter">Recruiter (Posting Jobs)</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-accent text-accent-foreground font-bold p-4 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 mt-4"
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <p className="mt-8 text-center text-muted-foreground text-sm">
          Already have an account?
          <a href="/login" className="text-accent font-semibold ml-2 hover:underline">
            Login
          </a>
        </p>
      </div>
    </div>
  );
}
