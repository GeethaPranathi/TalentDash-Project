"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import { toast } from "react-hot-toast";
import { PlusCircle, Briefcase, MapPin, IndianRupee } from "lucide-react";

export default function RecruiterPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    title: "",
    company: "",
    location: "",
    description: "",
    salary: ""
  });

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const res = await fetch("http://localhost:5000/jobs");
      const data = await res.json();
      setJobs(data);
      setLoading(false);
    } catch (err) {
      toast.error("Failed to load jobs");
      setLoading(false);
    }
  };

  const handlePostJob = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please login first");
      return;
    }

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      const res = await fetch("http://localhost:5000/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, postedById: payload.id })
      });

      if (res.ok) {
        toast.success("Job posted successfully!");
        setShowForm(false);
        setFormData({ title: "", company: "", location: "", description: "", salary: "" });
        fetchJobs();
      } else {
        toast.error("Failed to post job");
      }
    } catch (err) {
      toast.error("An error occurred");
    }
  };

  return (
    <DashboardLayout>
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Recruiter Dashboard</h1>
          <p className="text-muted-foreground">Manage your job listings and find talent.</p>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="bg-accent text-accent-foreground px-6 py-3 rounded-xl font-medium flex items-center gap-2 hover:opacity-90 transition-opacity"
        >
          <PlusCircle size={20} />
          {showForm ? "Cancel" : "Post New Job"}
        </button>
      </div>

      {showForm && (
        <div className="bg-card border border-border p-8 rounded-2xl shadow-sm mb-10 animate-in fade-in slide-in-from-top-4 duration-300">
          <h2 className="text-xl font-bold mb-6">Create Job Listing</h2>
          <form onSubmit={handlePostJob} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Job Title</label>
              <input 
                required
                className="w-full bg-background border border-border p-3 rounded-xl focus:ring-2 focus:ring-accent outline-none"
                placeholder="e.g. Senior Frontend Engineer"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Company Name</label>
              <input 
                required
                className="w-full bg-background border border-border p-3 rounded-xl focus:ring-2 focus:ring-accent outline-none"
                placeholder="e.g. Google"
                value={formData.company}
                onChange={(e) => setFormData({...formData, company: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Location</label>
              <input 
                required
                className="w-full bg-background border border-border p-3 rounded-xl focus:ring-2 focus:ring-accent outline-none"
                placeholder="e.g. Bangalore, India"
                value={formData.location}
                onChange={(e) => setFormData({...formData, location: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Salary Range</label>
              <input 
                required
                className="w-full bg-background border border-border p-3 rounded-xl focus:ring-2 focus:ring-accent outline-none"
                placeholder="e.g. 20L - 30L PA"
                value={formData.salary}
                onChange={(e) => setFormData({...formData, salary: e.target.value})}
              />
            </div>
            <div className="md:col-span-2 space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Job Description</label>
              <textarea 
                required
                rows={4}
                className="w-full bg-background border border-border p-3 rounded-xl focus:ring-2 focus:ring-accent outline-none resize-none"
                placeholder="Describe the role and requirements..."
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              />
            </div>
            <button 
              type="submit"
              className="md:col-span-2 bg-accent text-accent-foreground py-4 rounded-xl font-bold hover:opacity-90 transition-opacity"
            >
              Post Job Listing
            </button>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full text-center py-20 text-muted-foreground">Loading jobs...</div>
        ) : jobs.length > 0 ? (
          jobs.map(job => (
            <div key={job.id} className="bg-card border border-border p-6 rounded-2xl shadow-sm hover:shadow-md transition-all group">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-accent/10 rounded-xl text-accent group-hover:bg-accent group-hover:text-accent-foreground transition-colors">
                  <Briefcase size={24} />
                </div>
                <span className="text-xs text-muted-foreground">{new Date(job.createdAt).toLocaleDateString()}</span>
              </div>
              <h3 className="text-xl font-bold mb-1">{job.title}</h3>
              <p className="text-accent font-medium mb-4">{job.company}</p>
              
              <div className="space-y-2 mb-6">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin size={16} /> {job.location}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <IndianRupee size={16} /> {job.salary}
                </div>
              </div>

              <p className="text-sm text-muted-foreground line-clamp-3 mb-6">
                {job.description}
              </p>

              <button className="w-full border border-border py-2.5 rounded-xl text-sm font-medium hover:bg-muted transition-colors">
                View Applications
              </button>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-20 bg-muted/30 rounded-2xl border border-dashed border-border">
            <p className="text-muted-foreground">No jobs posted yet.</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}