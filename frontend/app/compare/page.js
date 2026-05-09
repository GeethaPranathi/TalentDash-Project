"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import { toast } from "react-hot-toast";
import { API_URL } from "../../utils/config";

export default function ComparePage() {
  const [salaries, setSalaries] = useState([]);
  const [company1, setCompany1] = useState("");
  const [company2, setCompany2] = useState("");

  useEffect(() => {
    fetch(`${API_URL}/salaries`)
      .then((res) => res.json())
      .then((data) => setSalaries(data))
      .catch(() => toast.error("Failed to fetch salary data"));
  }, []);

  const company1Data = salaries.find(
    (s) => s.company.toLowerCase() === company1.toLowerCase()
  );

  const company2Data = salaries.find(
    (s) => s.company.toLowerCase() === company2.toLowerCase()
  );

  return (
    <DashboardLayout>
      <div className="mb-10">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">Compare Salaries</h1>
        <p className="text-lg text-muted-foreground">
          See how companies stack up against each other.
        </p>
      </div>

      {/* INPUTS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        <input
          type="text"
          placeholder="Enter Company 1"
          className="p-4 rounded-xl border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
          value={company1}
          onChange={(e) => setCompany1(e.target.value)}
        />
        <input
          type="text"
          placeholder="Enter Company 2"
          className="p-4 rounded-xl border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
          value={company2}
          onChange={(e) => setCompany2(e.target.value)}
        />
      </div>

      {/* COMPARISON TABLE */}
      {company1Data && company2Data ? (
        <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden">
          <table className="w-full">
            <thead className="bg-muted text-muted-foreground border-b border-border">
              <tr>
                <th className="p-5 text-left font-semibold">Feature</th>
                <th className="p-5 text-left font-semibold">{company1Data.company}</th>
                <th className="p-5 text-left font-semibold">{company2Data.company}</th>
              </tr>
            </thead>
            <tbody className="text-foreground">
              <tr className="border-b border-border hover:bg-muted/50 transition-colors">
                <td className="p-5 font-medium">Role</td>
                <td className="p-5">{company1Data.role}</td>
                <td className="p-5">{company2Data.role}</td>
              </tr>
              <tr className="border-b border-border hover:bg-muted/50 transition-colors">
                <td className="p-5 font-medium">Level</td>
                <td className="p-5">{company1Data.level}</td>
                <td className="p-5">{company2Data.level}</td>
              </tr>
              <tr className="border-b border-border hover:bg-muted/50 transition-colors">
                <td className="p-5 font-medium">Location</td>
                <td className="p-5">{company1Data.location}</td>
                <td className="p-5">{company2Data.location}</td>
              </tr>
              <tr className="border-b border-border hover:bg-muted/50 transition-colors">
                <td className="p-5 font-medium">Experience</td>
                <td className="p-5">{company1Data.experience_years} yrs</td>
                <td className="p-5">{company2Data.experience_years} yrs</td>
              </tr>
              <tr className="border-b border-border hover:bg-muted/50 transition-colors">
                <td className="p-5 font-medium">Base Salary</td>
                <td className="p-5">₹ {company1Data.base_salary}</td>
                <td className="p-5">₹ {company2Data.base_salary}</td>
              </tr>
              <tr className="border-b border-border hover:bg-muted/50 transition-colors">
                <td className="p-5 font-medium">Bonus</td>
                <td className="p-5">₹ {company1Data.bonus}</td>
                <td className="p-5">₹ {company2Data.bonus}</td>
              </tr>
              <tr className="border-b border-border hover:bg-muted/50 transition-colors">
                <td className="p-5 font-medium">Stock</td>
                <td className="p-5">₹ {company1Data.stock}</td>
                <td className="p-5">₹ {company2Data.stock}</td>
              </tr>
              <tr className="border-b border-border bg-muted/20">
                <td className="p-5 font-bold">Total Compensation</td>
                <td className="p-5 font-bold text-accent text-xl">₹ {company1Data.total_compensation}</td>
                <td className="p-5 font-bold text-accent text-xl">₹ {company2Data.total_compensation}</td>
              </tr>
              <tr className="hover:bg-muted/50 transition-colors">
                <td className="p-5 font-bold">Better Compensation</td>
                <td className="p-5 text-2xl">
                  {company1Data.total_compensation > company2Data.total_compensation ? "🏆" : "-"}
                </td>
                <td className="p-5 text-2xl">
                  {company2Data.total_compensation > company1Data.total_compensation ? "🏆" : "-"}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-card p-10 rounded-2xl border border-border shadow-sm text-muted-foreground text-center">
          Enter two valid company names to compare salaries.
        </div>
      )}
    </DashboardLayout>
  );
}
