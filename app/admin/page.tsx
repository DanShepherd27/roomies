"use client";

import { useState, useEffect } from "react";
import AdminLogin from "@/components/AdminLogin";
import AdminPanel from "@/components/AdminPanel";

export default function AdminPage() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in as admin
    const adminStatus =
      typeof window !== "undefined" &&
      sessionStorage.getItem("isAdmin") === "true";
    setIsAdmin(adminStatus);
    setIsLoading(false);
  }, []);

  const handleAdminLogin = () => {
    setIsAdmin(true);
  };

  const handleLogout = () => {
    sessionStorage.removeItem("isAdmin");
    setIsAdmin(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
          <p className="mt-4 text-gray-600">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        {!isAdmin ? <AdminLogin onAuth={handleAdminLogin} /> : <AdminPanel />}
      </div>
    </div>
  );
}
