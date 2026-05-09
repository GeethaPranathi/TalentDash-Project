"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "../../../components/DashboardLayout";
import { toast } from "react-hot-toast";
import { User, Mail, Shield, Trash2, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function AdminUsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch("http://localhost:5000/users");
      const data = await res.json();
      setUsers(data);
      setLoading(false);
    } catch (err) {
      toast.error("Failed to load users");
      setLoading(false);
    }
  };

  const deleteUser = async (id) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    try {
      const res = await fetch(`http://localhost:5000/users/${id}`, {
        method: "DELETE"
      });
      if (res.ok) {
        setUsers(users.filter(u => u.id !== id));
        toast.success("User deleted successfully");
      }
    } catch (err) {
      toast.error("Failed to delete user");
    }
  };

  return (
    <DashboardLayout>
      <div className="flex justify-between items-center mb-10">
        <div>
          <Link href="/admin" className="text-accent flex items-center gap-2 mb-2 hover:underline">
            <ArrowLeft size={16} /> Back to Dashboard
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">User Management</h1>
          <p className="text-muted-foreground">Manage accounts and platform access.</p>
        </div>
      </div>

      <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted text-muted-foreground border-b border-border">
              <tr>
                <th className="p-5 text-left font-semibold">User</th>
                <th className="p-5 text-left font-semibold">Role</th>
                <th className="p-5 text-left font-semibold">Joined</th>
                <th className="p-5 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="text-foreground divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan="4" className="p-20 text-center text-muted-foreground">Loading users...</td>
                </tr>
              ) : users.map(user => (
                <tr key={user.id} className="hover:bg-muted/30 transition-colors">
                  <td className="p-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-accent">
                        <User size={20} />
                      </div>
                      <div>
                        <div className="font-bold">{user.email.split('@')[0]}</div>
                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                          <Mail size={12} /> {user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="p-5">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase flex items-center gap-1 w-fit ${
                      user.role === 'admin' ? 'bg-purple-500/10 text-purple-500' : 
                      user.role === 'recruiter' ? 'bg-blue-500/10 text-blue-500' : 
                      'bg-gray-500/10 text-gray-500'
                    }`}>
                      <Shield size={12} /> {user.role}
                    </span>
                  </td>
                  <td className="p-5 text-muted-foreground text-sm">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-5 text-right">
                    <button 
                      onClick={() => deleteUser(user.id)}
                      className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                    >
                      <Trash2 size={20} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
