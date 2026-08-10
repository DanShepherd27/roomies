"use client";

import { useState, useEffect, useSyncExternalStore } from "react";
import Link from "next/link";
import { getWateringHistory } from "@/lib/server-actions";

const MONDAY = 1;

function getCalendarLocale() {
  if (typeof navigator === "undefined") {
    return undefined;
  }

  return navigator.language;
}

const subscribeToLocale = () => () => {};
const getServerLocale = () => undefined;

function getFirstDayOfWeek(locale: string | undefined) {
  if (!locale) {
    return MONDAY;
  }

  try {
    const localeWithWeekInfo = new Intl.Locale(locale) as Intl.Locale & {
      getWeekInfo?: () => { firstDay: number };
    };
    return localeWithWeekInfo.getWeekInfo?.().firstDay ?? MONDAY;
  } catch {
    return MONDAY;
  }
}

export default function HistoryView() {
  const [history, setHistory] = useState<
    { roommate_name: string; timestamp: string }[]
  >([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);
  const locale = useSyncExternalStore(
    subscribeToLocale,
    getCalendarLocale,
    getServerLocale,
  );

  useEffect(() => {
    const fetchHistory = async () => {
      setIsLoading(true);
      const data = await getWateringHistory();
      setHistory(data);
      setIsLoading(false);
    };
    fetchHistory();
  }, []);

  const daysInMonth = (year: number, month: number) =>
    new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) =>
    new Date(year, month, 1).getDay();

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const displayLocale = locale ?? "en-GB";
  const monthName = currentMonth.toLocaleString(displayLocale, { month: "long" });

  const numDays = daysInMonth(year, month);
  const firstDayOfWeek = getFirstDayOfWeek(locale);
  const startDay = (firstDayOfMonth(year, month) - firstDayOfWeek + 7) % 7;
  const weekDays = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(2023, 0, firstDayOfWeek + index);
    return new Intl.DateTimeFormat(displayLocale, { weekday: "short" }).format(date);
  });

  const prevMonth = () => setCurrentMonth(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentMonth(new Date(year, month + 1, 1));

  const isWatered = (day: number) => {
    const dateStr = new Date(year, month, day).toDateString();
    return history.some(
      (item) => new Date(item.timestamp).toDateString() === dateStr,
    );
  };

  const calendarDays = [];
  for (let i = 0; i < startDay; i++) {
    calendarDays.push(
      <div
        key={`empty-${i}`}
        className="h-12 border-gray-100 border-b border-r"
      ></div>,
    );
  }

  for (let d = 1; d <= numDays; d++) {
    const watered = isWatered(d);
    calendarDays.push(
      <div
        key={d}
        className="h-12 border-gray-100 border-b border-r flex flex-col items-center justify-center relative"
      >
        <span className="text-xs text-gray-400 absolute top-1 left-1">{d}</span>
        {watered && <span className="text-green-600 font-bold text-xl">X</span>}
      </div>,
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-dynamic bg-gradient-to-br from-green-50 to-emerald-50 p-4">
      <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <Link
            href="/"
            className="text-sm font-medium text-gray-600 hover:text-green-600 transition"
          >
            ← Back
          </Link>
          <h2 className="text-xl font-bold text-gray-800">Watering History</h2>
          <div className="w-10"></div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-4">
              <button
                onClick={prevMonth}
                className="p-2 hover:bg-gray-100 rounded-full transition cursor-pointer text-gray-600"
              >
                ←
              </button>
              <h3 className="font-bold text-gray-700">
                {monthName} {year}
              </h3>
              <button
                onClick={nextMonth}
                className="p-2 hover:bg-gray-100 rounded-full transition cursor-pointer text-gray-600"
              >
                →
              </button>
            </div>

            <div className="grid grid-cols-7 border-t border-l border-gray-100">
              {weekDays.map((day) => (
                <div
                  key={day}
                  className="text-center text-[10px] font-bold text-gray-400 py-2 border-b border-r border-gray-100 uppercase"
                >
                  {day}
                </div>
              ))}
              {calendarDays}
            </div>

            <div className="mt-6 flex items-center justify-center space-x-2 text-sm text-gray-500">
              <span className="text-green-600 font-bold">X</span>
              <span>= Plants were watered</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
