"use client";

import { useEffect, useState } from "react";
import AdminLogin from "@/components/AdminLogin";
import AdminPanel from "@/components/AdminPanel";

interface AdminPageClientProps {
  deploymentVersion: string;
  environment: string;
}

export default function AdminPageClient({
  deploymentVersion,
  environment,
}: AdminPageClientProps) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const adminStatus = sessionStorage.getItem("isAdmin") === "true";
    setIsAdmin(adminStatus);
    setIsLoading(false);
  }, []);

  const handleAdminLogin = () => {
    setIsAdmin(true);
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
        <p className="mb-3 text-right text-xs text-gray-500" aria-label="Deployment version">
          Deploy: {environment} · {deploymentVersion}
        </p>
        {!isAdmin ? <AdminLogin onAuth={handleAdminLogin} /> : <AdminPanel />}
      </div>
    </div>
  );
}
