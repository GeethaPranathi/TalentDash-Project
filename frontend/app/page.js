"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "../components/DashboardLayout";
import { useAppContext } from "../components/AppContext";
import { toast } from "react-hot-toast";
import { API_URL } from "../utils/config";

import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
  LineChart, Line, CartesianGrid, Legend
} from "recharts";

export default function Home() {
  const [salaries, setSalaries] = useState([]);
  const [sortOrder, setSortOrder] = useState("high");
  const [loading, setLoading] = useState(true);
  const [locationFilter, setLocationFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [experience, setExperience] = useState("");
  const [predLevel, setPredLevel] = useState("Junior");
  const [predRole, setPredRole] = useState("Software Engineer");
  const [prediction, setPrediction] = useState(null);

  const { globalSearch } = useAppContext();

  // FETCH SALARIES
  useEffect(() => {
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
        setSalaries([]);
        setLoading(false);
      });
  }, []);

  // LOADING
  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-full bg-background text-foreground text-2xl font-semibold">
          Loading...
        </div>
      </DashboardLayout>
    );
  }

  // FILTERED DATA
  const filtered = salaries
    .filter((s) =>
      s.company?.toLowerCase().includes(globalSearch.toLowerCase())
    )
    .filter((s) =>
      locationFilter === "" ? true : s.location === locationFilter
    )
    .sort((a, b) => {
      if (sortOrder === "high") {
        return b.total_compensation - a.total_compensation;
      }
      return a.total_compensation - b.total_compensation;
    });

  // PAGINATION
  const rowsPerPage = 10;
  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginated = filtered.slice(startIndex, startIndex + rowsPerPage);

  // STATS
  const totalEntries = salaries.length;
  const avgComp =
    salaries.reduce(
      (acc, curr) => acc + (curr.total_compensation || 0),
      0
    ) / (salaries.length || 1);

  // CHART DATA - Average by Company
  const chartData = filtered.map((s) => ({
    company: s.company,
    compensation: s.total_compensation
  }));

  // PIE DATA - Location Distribution
  const locCounts = filtered.reduce((acc, curr) => {
    acc[curr.location] = (acc[curr.location] || 0) + 1;
    return acc;
  }, {});
  const pieData = Object.keys(locCounts).map(k => ({ name: k, value: locCounts[k] }));
  const COLORS = ['var(--accent)', '#a855f7', '#ec4899', '#f59e0b', '#3b82f6'];

  // LINE DATA - Salary vs Experience
  const trendData = filtered
    .sort((a, b) => a.experience_years - b.experience_years)
    .map(s => ({
      exp: s.experience_years,
      comp: s.total_compensation,
      company: s.company
    }));

  // UNIQUE LOCATIONS
  const uniqueLocations = [...new Set(salaries.map((s) => s.location))];

  return (
    <DashboardLayout>
      {/* PAGE TITLE */}
      <div className="mb-10">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">
          Compensation Intelligence Platform
        </h1>
        <p className="text-lg text-muted-foreground">
          Analyze salaries across companies, levels and locations.
        </p>
      </div>

      {/* STATS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-card p-6 rounded-2xl border border-border shadow-sm flex flex-col justify-between">
          <h2 className="text-muted-foreground font-medium mb-4">Total Entries</h2>
          <div className="flex justify-between items-end">
            <p className="text-4xl font-bold">{totalEntries}</p>
          </div>
        </div>

        <div className="bg-card p-6 rounded-2xl border border-border shadow-sm flex flex-col justify-between">
          <h2 className="text-muted-foreground font-medium mb-4">Average Compensation</h2>
          <div className="flex justify-between items-end">
            <p className="text-4xl font-bold text-accent">
              ₹ {Math.floor(avgComp).toLocaleString()}
            </p>
          </div>
        </div>

        <div className="bg-card p-6 rounded-2xl border border-border shadow-sm flex flex-col justify-between">
          <h2 className="text-muted-foreground font-medium mb-4">Top Company</h2>
          <div className="flex justify-between items-end">
            <p className="text-4xl font-bold">
              {filtered.length > 0 ? filtered[0].company : "N/A"}
            </p>
          </div>
        </div>
      </div>

      {/* AI PREDICTION & FILTERS ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* AI PREDICTION */}
        <div className="lg:col-span-1 bg-card p-6 rounded-2xl border border-border shadow-sm">
          <h2 className="text-xl font-bold mb-6">AI Salary Prediction</h2>
          <input
            type="number"
            placeholder="Years of Experience"
            className="border border-border bg-background p-4 rounded-xl w-full mb-4 text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
            value={experience}
            onChange={(e) => setExperience(e.target.value)}
          />
          <select
            className="border border-border bg-background p-4 rounded-xl w-full mb-4 text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
            value={predLevel}
            onChange={(e) => setPredLevel(e.target.value)}
          >
            <option value="Intern">Intern</option>
            <option value="Entry">Entry Level</option>
            <option value="Junior">Junior</option>
            <option value="Mid">Mid Level</option>
            <option value="Senior">Senior</option>
            <option value="Staff">Staff</option>
            <option value="Principal">Principal</option>
          </select>
          <input
            type="text"
            placeholder="Role (e.g. Frontend Engineer)"
            className="border border-border bg-background p-4 rounded-xl w-full mb-4 text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
            value={predRole}
            onChange={(e) => setPredRole(e.target.value)}
          />
          <button
            className="w-full bg-accent text-accent-foreground px-6 py-3 rounded-xl font-medium hover:opacity-90 transition-opacity"
            onClick={async () => {
              if (!experience) {
                toast.error("Please enter years of experience");
                return;
              }
              const loadingToast = toast.loading("Analyzing ML model...");
              try {
                const res = await fetch(`${API_URL}/predict-salary`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ experience, level: predLevel, role: predRole })
                });
                const data = await res.json();
                setPrediction(data.predictedSalary);
                toast.success(data.isFallback ? "Prediction complete (Fallback used)" : "Prediction complete!", { id: loadingToast });
              } catch (err) {
                toast.error("Failed to predict salary", { id: loadingToast });
              }
            }}
          >
            Predict Salary
          </button>
          {prediction && (
            <p className="mt-6 text-2xl font-bold text-green-500 text-center">
              ₹ {prediction}
            </p>
          )}
        </div>

        {/* FILTERS & LIST PLACEHOLDER */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <div className="bg-card p-6 rounded-2xl border border-border shadow-sm flex-1">
            <h2 className="text-xl font-bold mb-6">Data Filters</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <select
                className="p-4 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
              >
                <option value="high">Highest Compensation</option>
                <option value="low">Lowest Compensation</option>
              </select>

              <select
                className="p-4 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
              >
                <option value="">All Locations</option>
                {uniqueLocations.map((loc, index) => (
                  <option key={index} value={loc}>{loc}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* CHARTS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
        {/* BAR CHART */}
        <div className="bg-card p-6 rounded-2xl border border-border shadow-sm">
          <h2 className="text-xl font-bold mb-6">Compensation by Company</h2>
          <div className="w-full h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <XAxis dataKey="company" stroke="var(--muted-foreground)" tick={{ fill: 'var(--muted-foreground)' }} />
                <YAxis stroke="var(--muted-foreground)" tick={{ fill: 'var(--muted-foreground)' }} />
                <Tooltip 
                  cursor={{ fill: 'var(--muted)' }} 
                  contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', color: 'var(--foreground)' }} 
                />
                <Bar dataKey="compensation" fill="var(--accent)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* PIE CHART */}
        <div className="bg-card p-6 rounded-2xl border border-border shadow-sm">
          <h2 className="text-xl font-bold mb-6">Location Distribution</h2>
          <div className="w-full h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
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

        {/* LINE CHART */}
        <div className="lg:col-span-2 bg-card p-6 rounded-2xl border border-border shadow-sm">
          <h2 className="text-xl font-bold mb-6">Salary Growth vs. Experience</h2>
          <div className="w-full h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="exp" stroke="var(--muted-foreground)" label={{ value: 'Years of Experience', position: 'insideBottomRight', offset: -10 }} />
                <YAxis stroke="var(--muted-foreground)" />
                <Tooltip contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', color: 'var(--foreground)' }} />
                <Legend />
                <Line type="monotone" dataKey="comp" stroke="var(--accent)" strokeWidth={3} dot={{ r: 6 }} activeDot={{ r: 8 }} name="Compensation" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
