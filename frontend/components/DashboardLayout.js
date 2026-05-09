"use client";

import { useEffect, useState } from "react";
import {
  Cloud,
  Search,
  Bell,
  LayoutDashboard,
  BarChart2,
  UserCircle,
  Settings,
  Sun,
  Moon
} from "lucide-react";
import Link from "next/link";
import { useAppContext } from "./AppContext";
import { motion, AnimatePresence } from "framer-motion";

export default function DashboardLayout({ children }) {
  const [darkMode, setDarkMode] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);
  const { globalSearch, setGlobalSearch } = useAppContext();
  const [notifications, setNotifications] = useState([]);
  const [userData, setUserData] = useState(null);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        setUserId(payload.id);
        fetchProfile(payload.id);
      } catch (e) {
        console.error("Failed to parse token");
      }
    }
  }, []);

  const fetchProfile = async (id) => {
    try {
      const res = await fetch(`http://localhost:5000/profile/${id}`);
      const data = await res.json();
      setUserData(data);
    } catch (err) {
      console.error("Failed to fetch profile");
    }
  };

  useEffect(() => {
    if (userId) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 30000); // Poll every 30s
      return () => clearInterval(interval);
    }
  }, [userId]);

  const fetchNotifications = async () => {
    try {
      const res = await fetch(`http://localhost:5000/notifications/${userId}`);
      const data = await res.json();
      setNotifications(data);
    } catch (err) {
      console.error("Failed to fetch notifications");
    }
  };

  const markAsRead = async (id) => {
    try {
      await fetch(`http://localhost:5000/notifications/read/${id}`, { method: "PUT" });
      setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
    } catch (err) {
      console.error("Failed to mark as read");
    }
  };

  const clearNotifications = async () => {
    try {
      await fetch(`http://localhost:5000/notifications/clear/${userId}`, { method: "DELETE" });
      setNotifications([]);
      setShowNotifications(false);
    } catch (err) {
      console.error("Failed to clear notifications");
    }
  };

  // Apply dark mode class to root HTML element
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  return (
    <div className="flex min-h-screen bg-background text-foreground transition-colors duration-200">
      {/* SIDEBAR */}
      <aside className="w-64 bg-sidebar border-r border-border p-6 hidden md:flex flex-col transition-colors duration-200">
        <div className="flex items-center gap-2 text-xl font-bold mb-10 text-foreground">
          <Cloud className="text-accent" /> TalentDash
        </div>

        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center text-accent mb-2 overflow-hidden border-2 border-accent/20">
            {userData?.profilePic ? (
              <img src={userData.profilePic} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <UserCircle size={40} />
            )}
          </div>
          <h3 className="font-semibold text-foreground capitalize">
            {userData?.name || (userData?.role ? `${userData.role} User` : "Loading...")}
          </h3>
          <p className="text-xs text-green-500 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-green-500 inline-block animate-pulse"></span> Active
          </p>
        </div>

        <nav className="flex-1 space-y-2">
          <Link href="/" className="flex items-center gap-3 bg-accent text-accent-foreground px-4 py-3 rounded-xl font-medium transition-colors">
            <LayoutDashboard size={20} /> Dashboard
          </Link>
          <Link href="/compare" className="flex items-center gap-3 text-muted-foreground hover:text-foreground px-4 py-3 rounded-xl transition-colors">
            <BarChart2 size={20} /> Compare
          </Link>
          <Link href="/profile" className="flex items-center gap-3 text-muted-foreground hover:text-foreground px-4 py-3 rounded-xl transition-colors">
            <UserCircle size={20} /> Profile
          </Link>
          {(userData?.role === "admin" || userData?.role === "recruiter") && (
            <Link href="/recruiter" className="flex items-center gap-3 text-muted-foreground hover:text-foreground px-4 py-3 rounded-xl transition-colors">
              <Cloud size={20} /> Recruiter
            </Link>
          )}
          {userData?.role === "admin" && (
            <Link href="/admin" className="flex items-center gap-3 text-muted-foreground hover:text-foreground px-4 py-3 rounded-xl transition-colors">
              <Settings size={20} /> Admin
            </Link>
          )}
        </nav>
      </aside>

      {/* MAIN */}
      <main className="flex-1 flex flex-col p-6 md:p-8 overflow-y-auto h-screen">
        {/* HEADER */}
        <header className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4 shrink-0">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
            <input
              type="text"
              placeholder="Search..."
              value={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.value)}
              className="w-full bg-card text-foreground pl-10 pr-4 py-2.5 rounded-full border border-border focus:outline-none focus:ring-2 focus:ring-accent transition-colors"
            />
          </div>
          <div className="flex items-center gap-4 w-full sm:w-auto justify-end">
            <button 
              onClick={() => setDarkMode(!darkMode)}
              className="p-2.5 rounded-full bg-card border border-border text-foreground hover:bg-muted transition-colors"
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2.5 rounded-full bg-card border border-border text-foreground hover:bg-muted transition-colors relative"
              >
                <Bell size={20} />
                {notifications.filter(n => !n.read).length > 0 && (
                  <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
                )}
              </button>
              
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-64 bg-card border border-border rounded-xl shadow-lg z-50 overflow-hidden">
                  <div className="p-3 border-b border-border font-semibold">
                    Notifications
                  </div>
                  {notifications.length > 0 ? (
                    <div className="max-h-64 overflow-y-auto">
                      {notifications.map(n => (
                        <div 
                          key={n.id} 
                          onClick={() => markAsRead(n.id)}
                          className={`p-3 border-b border-border last:border-0 hover:bg-muted cursor-pointer transition-colors ${!n.read ? 'bg-accent/5' : ''}`}
                        >
                          <p className={`text-sm ${!n.read ? 'font-bold' : ''}`}>{n.message}</p>
                          <p className="text-xs text-muted-foreground mt-1">{new Date(n.createdAt).toLocaleTimeString()}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 text-center text-sm text-muted-foreground">
                      No new notifications
                    </div>
                  )}
                  {notifications.length > 0 && (
                    <button 
                      onClick={clearNotifications}
                      className="w-full p-2 text-xs text-center text-accent hover:bg-muted transition-colors font-medium"
                    >
                      Clear all
                    </button>
                  )}
                </div>
              )}
            </div>
            <button 
              onClick={() => {
                localStorage.removeItem("token");
                window.location.href = "/login";
              }}
              className="px-5 py-2.5 rounded-full bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors whitespace-nowrap"
            >
              Logout
            </button>
          </div>
        </header>

        {/* CONTENT */}
        <div className="flex-1 pb-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={globalSearch} // simplistic way to trigger re-renders, better to key by route path if we had access to router easily here, but wrapping children is fine
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
