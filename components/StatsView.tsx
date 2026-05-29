"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { getWateringHistory } from "@/lib/server-actions";

type TimeRange = "30d" | "year" | "all";

interface StatsData {
  userCounts: { name: string; count: number }[];
  avgPeriod: number; // in hours
  maxGap: number; // in days
}

export default function StatsView() {
  const [history, setHistory] = useState<
    { roommate_name: string; timestamp: string }[]
  >([]);
  const [range, setRange] = useState<TimeRange>("30d");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      setIsLoading(true);
      const data = await getWateringHistory();
      setHistory(data);
      setIsLoading(false);
    };
    fetchHistory();
  }, []);

  const stats = useMemo((): StatsData => {
    if (history.length === 0)
      return { userCounts: [], avgPeriod: 0, maxGap: 0 };

    const now = new Date();
    const filteredHistory = history
      .filter((item) => {
        const date = new Date(item.timestamp);
        if (range === "30d") {
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(now.getDate() - 30);
          return date >= thirtyDaysAgo;
        }
        if (range === "year") {
          return date.getFullYear() === now.getFullYear();
        }
        return true; // "all"
      })
      .sort(
        (a, b) =>
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
      );

    if (filteredHistory.length === 0)
      return { userCounts: [], avgPeriod: 0, maxGap: 0 };

    // 1. Who watered the most
    const counts: Record<string, number> = {};
    filteredHistory.forEach((item) => {
      counts[item.roommate_name] = (counts[item.roommate_name] || 0) + 1;
    });
    const userCounts = Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    // 2. Average watering period and Max gap
    let totalGapMs = 0;
    let maxGapMs = 0;

    for (let i = 1; i < filteredHistory.length; i++) {
      const prev = new Date(filteredHistory[i - 1].timestamp).getTime();
      const current = new Date(filteredHistory[i].timestamp).getTime();
      const gap = current - prev;
      totalGapMs += gap;
      if (gap > maxGapMs) maxGapMs = gap;
    }

    // Also consider the gap from the last watering to now if the range is "all" or if we want real current status
    const lastWatering = new Date(
      filteredHistory[filteredHistory.length - 1].timestamp,
    ).getTime();
    const currentGap = now.getTime() - lastWatering;
    if (currentGap > maxGapMs) maxGapMs = currentGap;

    const avgPeriodHours =
      filteredHistory.length > 1
        ? totalGapMs / (filteredHistory.length - 1) / (1000 * 60 * 60)
        : 0;

    const maxGapDays = maxGapMs / (1000 * 60 * 60 * 24);

    return {
      userCounts,
      avgPeriod: avgPeriodHours,
      maxGap: maxGapDays,
    };
  }, [history, range]);

  const maxCount = Math.max(...stats.userCounts.map((u) => u.count), 1);
  const colors = [
    "bg-green-500",
    "bg-emerald-500",
    "bg-teal-500",
    "bg-lime-500",
    "bg-green-400",
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 p-4">
      <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-lg">
        <div className="flex justify-between items-center mb-6">
          <Link
            href="/"
            className="text-sm font-medium text-gray-600 hover:text-green-600 transition"
          >
            ← Back
          </Link>
          <h2 className="text-xl font-bold text-gray-800">Watering Stats</h2>
          <div className="w-10"></div>
        </div>

        {/* Range Selector */}
        <div className="flex bg-gray-100 p-1 rounded-xl mb-8">
          {(["30d", "year", "all"] as TimeRange[]).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition cursor-pointer ${
                range === r
                  ? "bg-white text-green-600 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {r === "30d"
                ? "Last 30 Days"
                : r === "year"
                  ? "This Year"
                  : "All Time"}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          </div>
        ) : history.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            No data available yet.
          </div>
        ) : (
          <>
            {/* Top Waterers Chart */}
            <div className="mb-10">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">
                Top Waterers
              </h3>
              <div className="space-y-4">
                {stats.userCounts.map((user, index) => (
                  <div key={user.name} className="relative pt-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-semibold text-gray-700">
                        {user.name}
                      </span>
                      <span className="text-xs font-bold text-green-600">
                        {user.count} times
                      </span>
                    </div>
                    <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-100">
                      <div
                        style={{ width: `${(user.count / maxCount) * 100}%` }}
                        className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${colors[index % colors.length]}`}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Insight Cards */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-green-50 p-4 rounded-xl border border-green-100">
                <p className="text-xs font-bold text-green-700 uppercase mb-1">
                  Avg. Period
                </p>
                <p className="text-2xl font-bold text-gray-800">
                  {stats.avgPeriod.toFixed(1)}{" "}
                  <span className="text-sm font-normal text-gray-500">hrs</span>
                </p>
                <p className="text-[10px] text-green-600 mt-1">
                  Between waterings
                </p>
              </div>
              <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100">
                <p className="text-xs font-bold text-emerald-700 uppercase mb-1">
                  Longest Gap
                </p>
                <p className="text-2xl font-bold text-gray-800">
                  {stats.maxGap.toFixed(1)}{" "}
                  <span className="text-sm font-normal text-gray-500">
                    days
                  </span>
                </p>
                <p className="text-[10px] text-emerald-600 mt-1">
                  Without water
                </p>
              </div>
            </div>
          </>
        )}

        <p className="text-center text-[10px] text-gray-400 mt-8">
          Data updated in real-time from Vercel Blob
        </p>
      </div>
    </div>
  );
}
