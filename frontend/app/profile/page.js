"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import { toast } from "react-hot-toast";
import { User, Camera, Save, X, Edit2 } from "lucide-react";
import { API_URL } from "../../utils/config";

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    profilePic: ""
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = JSON.parse(atob(token.split(".")[1]));
        fetchProfile(decoded.id);
      } catch (err) {
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  const fetchProfile = async (id) => {
    try {
      const res = await fetch(`${API_URL}/profile/${id}`);
      const data = await res.json();
      setUser(data);
      setFormData({
        name: data.name || "",
        profilePic: data.profilePic || ""
      });
      setLoading(false);
    } catch (err) {
      toast.error("Failed to load profile");
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    try {
      const res = await fetch(`${API_URL}/profile/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        const updated = await res.json();
        setUser(updated);
        setIsEditing(false);
        toast.success("Profile updated successfully!");
      }
    } catch (err) {
      toast.error("Failed to update profile");
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="min-h-[60vh] flex justify-center items-center">
          <p className="text-xl font-medium text-muted-foreground animate-pulse">Loading profile...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!user) {
    return (
      <DashboardLayout>
        <div className="min-h-[60vh] flex justify-center items-center">
          <div className="bg-card p-10 rounded-2xl shadow-sm border border-border text-center max-w-sm w-full">
            <h1 className="text-3xl font-bold mb-4 text-foreground">Not Logged In</h1>
            <a href="/login" className="bg-accent text-accent-foreground px-6 py-3 rounded-xl inline-block hover:opacity-90 transition-opacity">
              Go To Login
            </a>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex justify-center items-center min-h-[80vh] py-10">
        <div className="bg-card rounded-3xl shadow-xl border border-border w-full max-w-2xl overflow-hidden">
          {/* BANNER/HEADER */}
          <div className="h-32 bg-gradient-to-r from-accent to-purple-600 relative">
            <button 
              onClick={() => setIsEditing(!isEditing)}
              className="absolute bottom-4 right-4 bg-white/20 backdrop-blur-md text-white p-2.5 rounded-full hover:bg-white/30 transition-all border border-white/30 shadow-lg"
            >
              {isEditing ? <X size={20} /> : <Edit2 size={20} />}
            </button>
          </div>

          <div className="px-8 pb-10 -mt-16">
            <div className="flex flex-col md:flex-row items-end gap-6 mb-10">
              {/* PROFILE IMAGE */}
              <div className="relative group">
                <div className="w-32 h-32 rounded-3xl bg-card border-4 border-card shadow-2xl overflow-hidden flex items-center justify-center">
                  {formData.profilePic ? (
                    <img src={formData.profilePic} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-4xl font-bold text-accent bg-accent/10 w-full h-full flex items-center justify-center">
                      {user.email?.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                {isEditing && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-3xl">
                    <label className="cursor-pointer flex flex-col items-center gap-1 text-white text-xs font-bold">
                      <Camera size={24} />
                      <span>CHANGE</span>
                      <input 
                        type="text" 
                        placeholder="Image URL" 
                        className="hidden" 
                        onChange={(e) => {
                          const url = prompt("Enter Image URL:");
                          if (url) setFormData({...formData, profilePic: url});
                        }}
                      />
                    </label>
                  </div>
                )}
              </div>

              <div className="flex-1 pb-2">
                <h1 className="text-3xl font-bold text-foreground">
                  {isEditing ? (
                    <input 
                      className="bg-muted/50 border-b-2 border-accent outline-none px-2 py-1 w-full"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      placeholder="Your Full Name"
                    />
                  ) : (
                    user.name || "Anonymous User"
                  )}
                </h1>
                <p className="text-muted-foreground flex items-center gap-2">
                  <User size={16} className="text-accent" /> {user.role.toUpperCase()}
                </p>
              </div>
            </div>

            {/* DETAILS GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Email Address</label>
                <div className="p-4 rounded-2xl bg-muted/30 border border-border text-foreground font-medium opacity-70">
                  {user.email}
                </div>
                <p className="text-[10px] text-muted-foreground">Email cannot be changed.</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Member Since</label>
                <div className="p-4 rounded-2xl bg-muted/30 border border-border text-foreground font-medium">
                  {new Date(user.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
              </div>

              {isEditing && (
                <div className="md:col-span-2 space-y-2">
                  <label className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Profile Photo URL</label>
                  <input 
                    className="w-full bg-background border border-border p-4 rounded-2xl outline-none focus:ring-2 focus:ring-accent"
                    placeholder="https://example.com/photo.jpg"
                    value={formData.profilePic}
                    onChange={(e) => setFormData({...formData, profilePic: e.target.value})}
                  />
                </div>
              )}
            </div>

            {/* ACTIONS */}
            <div className="flex gap-4 mt-12">
              {isEditing ? (
                <>
                  <button 
                    onClick={handleUpdate}
                    className="flex-1 bg-accent text-accent-foreground py-4 rounded-2xl font-bold shadow-lg shadow-accent/20 hover:opacity-90 transition-all flex items-center justify-center gap-2"
                  >
                    <Save size={20} /> Save Changes
                  </button>
                  <button 
                    onClick={() => {
                      setIsEditing(false);
                      setFormData({ name: user.name || "", profilePic: user.profilePic || "" });
                    }}
                    className="flex-1 bg-muted text-foreground py-4 rounded-2xl font-bold hover:bg-muted/80 transition-all"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <button 
                    onClick={() => setIsEditing(true)}
                    className="flex-1 bg-accent text-accent-foreground py-4 rounded-2xl font-bold shadow-lg shadow-accent/20 hover:opacity-90 transition-all flex items-center justify-center gap-2"
                  >
                    <Edit2 size={20} /> Edit Profile
                  </button>
                  <button 
                    onClick={() => {
                      localStorage.removeItem("token");
                      window.location.href = "/login";
                    }}
                    className="flex-1 border border-red-500/30 text-red-500 py-4 rounded-2xl font-bold hover:bg-red-500/10 transition-all"
                  >
                    Logout
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
