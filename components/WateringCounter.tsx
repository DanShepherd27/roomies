"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { recordWatering, getLastWateringTime } from "@/lib/server-actions";
import { deleteCookie } from "@/lib/cookies";

interface WateringCounterProps {
  deviceId: string;
  roommateName: string;
}

export default function WateringCounter({
  deviceId,
  roommateName,
}: WateringCounterProps) {
  const [daysAgo, setDaysAgo] = useState<string>("loading...");
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const calculateDaysAgo = (timestamp: string) => {
    const lastWateringDate = new Date(timestamp);
    const today = new Date();
    const diffTime = today.getTime() - lastWateringDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
      if (diffHours === 0) {
        const diffMinutes = Math.floor(diffTime / (1000 * 60));
        return `${diffMinutes} minute${diffMinutes !== 1 ? "s" : ""} ago`;
      }
      return `${diffHours} hour${diffHours !== 1 ? "s" : ""} ago`;
    }

    return `${diffDays} day${diffDays !== 1 ? "s" : ""} ago`;
  };

  const fetchLastWateringTime = useCallback(async () => {
    const timestamp = await getLastWateringTime(deviceId);
    if (timestamp) {
      setDaysAgo(calculateDaysAgo(timestamp));
      setLastUpdate(new Date(timestamp));
    } else {
      setDaysAgo("Never");
    }
  }, [deviceId]);

  useEffect(() => {
    // Immediately fetch the last watering time
    const fetchImmediate = async () => {
      await fetchLastWateringTime();
    };

    fetchImmediate();
    // Refresh every minute
    const interval = setInterval(fetchLastWateringTime, 60000);
    return () => clearInterval(interval);
  }, [fetchLastWateringTime]);

  const handleWaterPlants = async () => {
    setIsLoading(true);
    const result = await recordWatering(deviceId, roommateName);

    if (result.success && result.timestamp) {
      setDaysAgo("0 minutes ago");
      setLastUpdate(new Date(result.timestamp));
    }

    setIsLoading(false);
  };

  const handleLogout = () => {
    deleteCookie("deviceId");
    deleteCookie("roommateName");
    window.location.reload();
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-dynamic bg-gradient-to-br from-green-50 to-emerald-50 p-4">
      <div className="absolute top-4 right-4 flex items-center space-x-4">
        <Link
          href="/stats"
          className="text-gray-600 hover:text-green-600 text-sm font-medium transition"
        >
          Stats
        </Link>
        <Link
          href="/history"
          className="text-gray-600 hover:text-green-600 text-sm font-medium transition"
        >
          History
        </Link>
        <button
          onClick={handleLogout}
          className="text-gray-600 hover:text-gray-800 text-sm font-medium cursor-pointer transition"
        >
          Logout
        </button>
      </div>

      <div className="text-center flex flex-col items-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">🌿 Roomies</h1>
        <p className="text-gray-600 mb-8">Plant Watering Tracker</p>

        <div className="mb-12">
          <p className="text-gray-700 text-lg font-medium mb-2">
            Hello, {roommateName}!
          </p>
          <p className="text-gray-600">
            Plants last watered:{" "}
            <span className="font-bold text-green-600 text-xl">{daysAgo}</span>
          </p>
        </div>

        <button
          onClick={handleWaterPlants}
          disabled={isLoading}
          className={`relative w-40 h-40 rounded-full bg-gradient-to-br from-green-400 to-green-600 hover:from-green-500 hover:to-green-700 disabled:from-gray-400 disabled:to-gray-500 shadow-2xl transition-all duration-200 transform hover:scale-105 disabled:scale-100 flex items-center justify-center cursor-pointer ${
            !isLoading ? "animate-pulse-scale" : ""
          }`}
        >
          <Image
            src="/watering_pot_icon.png"
            alt="Watering pot"
            width={80}
            height={80}
            className={!isLoading ? "animate-pulse" : ""}
          />
          {isLoading && (
            <div className="absolute inset-0 rounded-full animate-spin">
              <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-white opacity-50"></div>
            </div>
          )}
        </button>

        <p className="text-gray-600 mt-8 text-sm">Tap to water the plants!</p>

        <p className="text-gray-500 text-xs mt-6">
          {lastUpdate && `Last watered: ${lastUpdate.toLocaleString()}`}
        </p>
      </div>
    </div>
  );
}
