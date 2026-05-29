"use client";

import { useState, useEffect } from "react";
import { generateAccessCode } from "@/lib/code-generator";
import {
  getAllAccessCodes,
  addAccessCode,
  deleteAccessCode,
  updateAccessCodeName,
  toggleAccessCodeAdmin,
} from "@/lib/admin-actions";

interface CodeEntry {
  code: string;
  name: string;
  createdAt: string;
  isAdmin?: boolean;
}

export default function AdminPanel() {
  const [codes, setCodes] = useState<CodeEntry[]>([]);
  const [newCode, setNewCode] = useState("");
  const [newName, setNewName] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editingCode, setEditingCode] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");

  const loadCodes = async () => {
    try {
      const loadedCodes = await getAllAccessCodes();
      setCodes(loadedCodes);
    } catch {
      setError("Failed to load codes");
    }
  };

  useEffect(() => {
    void loadCodes();
  }, []);

  const handleGenerateCode = () => {
    const code = generateAccessCode();
    setNewCode(code);
  };

  const handleAddCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!newCode.trim()) {
      setError("Please enter or generate a code");
      return;
    }

    if (!newName.trim()) {
      setError("Please enter a name for this roommate");
      return;
    }

    const result = await addAccessCode(newCode, newName);
    if (result.success) {
      setSuccess(`Code "${newCode}" created successfully!`);
      setNewCode("");
      setNewName("");
      await loadCodes();
    } else {
      setError(result.error || "Failed to add code");
    }
  };

  const handleDeleteCode = async (code: string) => {
    if (!confirm(`Delete code "${code}"? This cannot be undone.`)) {
      return;
    }

    const result = await deleteAccessCode(code);
    if (result.success) {
      setSuccess(`Code "${code}" deleted`);
      await loadCodes();
    } else {
      setError(result.error || "Failed to delete code");
    }
  };

  const handleUpdateName = async (code: string) => {
    if (!editingName.trim()) {
      setError("Please enter a name");
      return;
    }

    const result = await updateAccessCodeName(code, editingName);
    if (result.success) {
      setSuccess("Name updated");
      setEditingCode(null);
      setEditingName("");
      await loadCodes();
    } else {
      setError(result.error || "Failed to update name");
    }
  };

  const handleToggleAdmin = async (code: string) => {
    if (isLastAdmin(code)) {
      alert(
        "Cannot revoke admin status from the last admin code. Please assign another code as admin before revoking this one.",
      );
      return;
    }

    const result = await toggleAccessCodeAdmin(code);
    if (result.success) {
      setSuccess("Admin status updated");
      await loadCodes();
    } else {
      setError(result.error || "Failed to toggle admin status");
    }
  };

  const isLastAdmin = (code: string): boolean => {
    const codeEntry = codes.find((c) => c.code === code);
    if (!codeEntry?.isAdmin) return false;
    const adminCount = codes.filter((c) => c.isAdmin).length;
    return adminCount === 1;
  };

  const handleLogout = () => {
    sessionStorage.removeItem("isAdmin");
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-800">🔐 Admin Panel</h1>
            <p className="text-gray-600">Manage roommate access codes</p>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition cursor-pointer"
          >
            Logout
          </button>
        </div>

        {/* Add New Code Section */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Add New Access Code
          </h2>

          <form onSubmit={handleAddCode} className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Access Code
                </label>
                <input
                  type="text"
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value)}
                  placeholder="e.g., ALICE2024"
                  className="w-full md:w-fit px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-600"
                />
              </div>

              <div className="flex items-end">
                <button
                  type="button"
                  onClick={handleGenerateCode}
                  className="w-full md:w-fit px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition cursor-pointer"
                >
                  Generate
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Roommate Name
                </label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g., Alice"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-600"
                />
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full text-nowrap px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition cursor-pointer"
                >
                  Add Code
                </button>
              </div>
            </div>

            {error && <p className="text-red-600 text-sm">{error}</p>}
            {success && <p className="text-green-600 text-sm">{success}</p>}
          </form>
        </div>

        {/* Existing Codes Section */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Existing Codes
          </h2>

          {codes.length === 0 ? (
            <p className="text-gray-600">No access codes yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">
                      Code
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">
                      Name
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">
                      Created
                    </th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-700">
                      Admin
                    </th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {codes.map((code) => (
                    <tr
                      key={code.code}
                      className="border-b border-gray-200 hover:bg-gray-50"
                    >
                      <td className="py-3 px-4 font-mono font-semibold text-blue-600">
                        {code.code}
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {editingCode === code.code ? (
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={editingName}
                              onChange={(e) => setEditingName(e.target.value)}
                              className="flex-1 px-2 py-1 border border-gray-300 rounded outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <button
                              onClick={() => handleUpdateName(code.code)}
                              className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm font-medium transition cursor-pointer"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingCode(null)}
                              className="px-3 py-1 bg-gray-400 hover:bg-gray-500 text-white rounded text-sm font-medium transition cursor-pointer"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          code.name
                        )}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-500">
                        {new Date(code.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => handleToggleAdmin(code.code)}
                          className={`px-3 py-1 rounded text-sm font-medium transition cursor-pointer ${
                            code.isAdmin
                              ? "bg-purple-600 hover:bg-purple-700 text-white"
                              : "bg-gray-300 hover:bg-gray-400 text-gray-800"
                          }`}
                        >
                          {code.isAdmin ? "✓ Admin" : "User"}
                        </button>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => {
                            setEditingCode(code.code);
                            setEditingName(code.name);
                          }}
                          className="w-full md:w-fit px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-medium transition mr-2 cursor-pointer"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteCode(code.code)}
                          disabled={isLastAdmin(code.code)}
                          className="w-full md:w-fit px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm font-medium transition cursor-pointer disabled:bg-gray-400 disabled:hover:bg-gray-400 disabled:cursor-not-allowed"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
