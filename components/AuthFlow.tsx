"use client";

import { useState, useEffect } from "react";
import { isValidAccessCode, getDefaultNameForCode } from "@/lib/access-codes";
import { setCookie, getCookie } from "@/lib/cookies";

interface AuthFlowProps {
  onAuth: (deviceId: string, roommateName: string, accessCode: string) => void;
}

export default function AuthFlow({ onAuth }: AuthFlowProps) {
  const [step, setStep] = useState<"loading" | "access-code" | "name-entry">(
    "loading",
  );
  const [accessCode, setAccessCode] = useState("");
  const [roommateName, setRoommateName] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const initializeAuth = async () => {
      // Check if user already has credentials stored in cookies
      const storedDeviceId = getCookie("deviceId");
      const storedRoommateName = getCookie("roommateName");
      const storedAccessCode = getCookie("accessCode");

      if (storedDeviceId && storedRoommateName && storedAccessCode) {
        // User is already authenticated
        onAuth(storedDeviceId, storedRoommateName, storedAccessCode);
        return;
      }

      // No valid session, go to access code entry
      setStep("access-code");
    };

    initializeAuth();
  }, [onAuth]);

  const handleAccessCodeSubmit = async (
    e: React.SubmitEvent<HTMLFormElement>,
  ) => {
    e.preventDefault();
    setError("");

    if (!accessCode.trim()) {
      setError("Please enter an access code.");
      return;
    }

    const isValid = await isValidAccessCode(accessCode);
    if (!isValid) {
      setError("Invalid access code. Please try again.");
      return;
    }

    const defaultName = await getDefaultNameForCode(accessCode);
    setRoommateName(defaultName);
    setStep("name-entry");
  };

  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!roommateName.trim()) {
      setError("Please enter your name.");
      return;
    }

    // Use a simplified device ID based on the access code + a random string
    const deviceId = `device_${accessCode.toLowerCase().trim()}_${Math.random().toString(36).substring(2, 7)}`;

    // Store in cookies
    setCookie("deviceId", deviceId, 365);
    setCookie("roommateName", roommateName, 365);
    setCookie("accessCode", accessCode.toUpperCase().trim(), 365);

    onAuth(deviceId, roommateName, accessCode.toUpperCase().trim());
  };

  if (step === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mb-4"></div>
          <p className="text-gray-600">Initializing...</p>
        </div>
      </div>
    );
  }

  if (step === "access-code") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
          <h1 className="text-3xl font-bold text-gray-800 mb-2 text-center">
            🌿 Roomies
          </h1>
          <p className="text-gray-600 text-center mb-6">
            Plant Watering Tracker
          </p>

          <form onSubmit={handleAccessCodeSubmit}>
            <div className="mb-6">
              <label
                htmlFor="code"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Enter Access Code
              </label>
              <input
                id="code"
                type="text"
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value)}
                placeholder="e.g., ROOM001"
                className="text-gray-600 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                autoFocus
              />
              {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
            </div>
            <button
              type="submit"
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition cursor-pointer"
            >
              Verify Access
            </button>
          </form>

          <p className="text-gray-500 text-xs text-center mt-4">
            Ask your roommate for the access code
          </p>
        </div>
      </div>
    );
  }

  if (step === "name-entry") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
          <h1 className="text-3xl font-bold text-gray-800 mb-2 text-center">
            🌿 Roomies
          </h1>
          <p className="text-gray-600 text-center mb-6">
            Plant Watering Tracker
          </p>

          <form onSubmit={handleNameSubmit}>
            <div className="mb-6">
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                What&apos;s your name?
              </label>
              <input
                id="name"
                type="text"
                value={roommateName}
                onChange={(e) => setRoommateName(e.target.value)}
                placeholder="Enter your name"
                className="text-gray-600 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                autoFocus
              />
              {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
            </div>
            <button
              type="submit"
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition cursor-pointer"
            >
              Continue
            </button>
          </form>
        </div>
      </div>
    );
  }

  return null;
}
