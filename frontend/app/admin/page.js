"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import DashboardLayout from "../../components/DashboardLayout";
import { CSVLink } from "react-csv";
import { toast } from "react-hot-toast";
import { API_URL } from "../../utils/config";
import {
  PieChart, Pie, Cell,
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer
} from "recharts";

export default function AdminPage() {
  const router = useRouter();
  const [salaries, setSalaries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    fetch(`${API_URL}/salaries`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setSalaries(data);
        } else {
          setSalaries([]);
        }
        setLoading(false);
      })
      .catch((err) => {
        setLoading(false);
      });
  }, []);

  async function deleteSalary(id) {
    try {
      await fetch(`${API_URL}/delete-salary/${id}`, {
        method: "DELETE"
      });
      setSalaries(salaries.filter((salary) => salary.id !== id));
      toast.success("Salary record deleted successfully");
    } catch (err) {
      toast.error("Failed to delete record");
    }
  }

  async function approveSalary(id, status) {
    try {
      const res = await fetch(`${API_URL}/approve-salary/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        setSalaries(salaries.map(s => s.id === id ? { ...s, status } : s));
        toast.success(`Salary ${status} successfully`);
      }
    } catch (err) {
      toast.error("Failed to update status");
    }
  }

  // DATA PROCESSING FOR CHARTS
  const COLORS = ['var(--accent)', '#a855f7', '#ec4899', '#f59e0b', '#3b82f6'];
  
  // Location Pie Chart Data
  const locationCounts = salaries.reduce((acc, curr) => {
    acc[curr.location] = (acc[curr.location] || 0) + 1;
    return acc;
  }, {});
  const pieData = Object.keys(locationCounts).map(key => ({
    name: key,
    value: locationCounts[key]
  }));

  // Average Salary by Company Bar Chart Data
  const companyStats = salaries.reduce((acc, curr) => {
    if (!acc[curr.company]) {
      acc[curr.company] = { total: 0, count: 0 };
    }
    acc[curr.company].total += curr.total_compensation || 0;
    acc[curr.company].count += 1;
    return acc;
  }, {});
  
  const barData = Object.keys(companyStats).map(company => ({
    company,
    average: Math.floor(companyStats[company].total / companyStats[company].count)
  })).sort((a, b) => b.average - a.average).slice(0, 10); // Top 10

  const csvHeaders = [
    { label: "Company", key: "company" },
    { label: "Role", key: "role" },
    { label: "Level", key: "level" },
    { label: "Location", key: "location" },
    { label: "Base Salary", key: "base_salary" },
    { label: "Bonus", key: "bonus" },
    { label: "Stock", key: "stock" },
    { label: "Total Compensation", key: "total_compensation" },
  ];

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-full bg-background text-foreground text-2xl font-semibold">
          Loading...
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* TOPBAR */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-2">Manage compensation data and analytics</p>
        </div>
        <div className="flex gap-4">
          <Link 
            href="/admin/users"
            className="bg-card border border-border text-foreground px-6 py-3 rounded-xl font-medium hover:bg-muted transition-colors"
          >
            Manage Users
          </Link>
          <CSVLink 
            data={salaries} 
            headers={csvHeaders}
            filename={"talentdash-salaries.csv"}
            className="bg-accent text-accent-foreground px-6 py-3 rounded-xl font-medium hover:opacity-90 transition-opacity"
          >
            Export CSV Data
          </CSVLink>
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-card p-6 rounded-2xl shadow-sm border border-border">
          <h2 className="text-muted-foreground font-medium mb-4">Total Entries</h2>
          <p className="text-4xl font-bold">{salaries.length}</p>
        </div>

        <div className="bg-card p-6 rounded-2xl shadow-sm border border-border">
          <h2 className="text-muted-foreground font-medium mb-4">Highest Salary</h2>
          <p className="text-4xl font-bold text-accent">
            ₹ {salaries.length > 0 ? Math.max(...salaries.map((s) => s.total_compensation)).toLocaleString() : 0}
          </p>
        </div>

        <div className="bg-card p-6 rounded-2xl shadow-sm border border-border">
          <h2 className="text-muted-foreground font-medium mb-4">Companies</h2>
          <p className="text-4xl font-bold">
            {new Set(salaries.map((s) => s.company)).size}
          </p>
        </div>
      </div>

      {/* CHARTS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
        <div className="bg-card p-6 rounded-2xl shadow-sm border border-border">
          <h2 className="text-xl font-bold mb-6">Average Compensation by Company</h2>
          <div className="w-full h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <XAxis dataKey="company" stroke="var(--muted-foreground)" tick={{ fill: 'var(--muted-foreground)' }} />
                <YAxis stroke="var(--muted-foreground)" tick={{ fill: 'var(--muted-foreground)' }} />
                <Tooltip 
                  cursor={{ fill: 'var(--muted)' }} 
                  contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', color: 'var(--foreground)' }} 
                />
                <Bar dataKey="average" fill="var(--accent)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-card p-6 rounded-2xl shadow-sm border border-border">
          <h2 className="text-xl font-bold mb-6">Data Distribution by Location</h2>
          <div className="w-full h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', color: 'var(--foreground)' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-card rounded-2xl shadow-sm border border-border overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted text-muted-foreground border-b border-border">
            <tr>
              <th className="p-5 text-left font-semibold">Company</th>
              <th className="p-5 text-left font-semibold">Role</th>
              <th className="p-5 text-left font-semibold">Level</th>
              <th className="p-5 text-left font-semibold">Location</th>
              <th className="p-5 text-left font-semibold">Compensation</th>
              <th className="p-5 text-left font-semibold">Status</th>
              <th className="p-5 text-left font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="text-foreground">
            {salaries.map((s) => (
              <tr key={s.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                <td className="p-5 font-medium">
                  <div className="flex items-center gap-3">
                    <img src={`https://logo.clearbit.com/${s.company}.com`} className="w-10 h-10 rounded-full bg-white" alt="" />
                    {s.company}
                  </div>
                </td>
                <td className="p-5">{s.role}</td>
                <td className="p-5">{s.level}</td>
                <td className="p-5">{s.location}</td>
                <td className="p-5 font-bold text-accent">
                  ₹ {s.total_compensation}
                </td>
                <td className="p-5">
                   <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                     s.status === 'approved' ? 'bg-green-500/10 text-green-500' : 
                     s.status === 'rejected' ? 'bg-red-500/10 text-red-500' : 
                     'bg-yellow-500/10 text-yellow-500'
                   }`}>
                     {s.status || 'pending'}
                   </span>
                 </td>
                 <td className="p-5">
                   <div className="flex gap-2">
                     {s.status !== 'approved' && (
                       <button
                         onClick={() => approveSalary(s.id, 'approved')}
                         className="bg-green-500/10 text-green-500 hover:bg-green-500/20 px-3 py-2 rounded-lg transition-colors font-medium text-sm"
                       >
                         Approve
                       </button>
                     )}
                     <button
                       onClick={() => deleteSalary(s.id)}
                       className="bg-red-500/10 text-red-500 hover:bg-red-500/20 px-3 py-2 rounded-lg transition-colors font-medium text-sm"
                     >
                       Delete
                     </button>
                   </div>
                 </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
}
