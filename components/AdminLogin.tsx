"use client";

import { useState } from "react";
import { isMasterKey } from "@/lib/access-codes";

interface AdminLoginProps {
  onAuth: (isAdmin: boolean) => void;
}

export default function AdminLogin({ onAuth }: AdminLoginProps) {
  const [masterKey, setMasterKey] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!masterKey.trim()) {
      setError("Please enter an access code");
      return;
    }

    const isAdmin = await isMasterKey(masterKey);
    if (isAdmin) {
      // Store admin session in sessionStorage (not persistent like cookies)
      sessionStorage.setItem("isAdmin", "true");
      onAuth(true);
    } else {
      setError("This access code does not have admin privileges");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
        <h1 className="text-3xl font-bold text-gray-800 mb-2 text-center">
          🔐 Admin
        </h1>
        <p className="text-gray-600 text-center mb-6">Access Code Management</p>

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label
              htmlFor="masterKey"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Access Code
            </label>
            <input
              id="masterKey"
              type="password"
              value={masterKey}
              onChange={(e) => setMasterKey(e.target.value)}
              placeholder="Enter your access code"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-600"
              autoFocus
            />
            {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition"
          >
            Login
          </button>
        </form>

        <p className="text-gray-500 text-xs mt-6 text-center">
          Enter an access code with admin privileges
        </p>
      </div>
    </div>
  );
}
