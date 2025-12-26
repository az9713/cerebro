'use client';

import { useEffect, useState } from 'react';
import { ActivityLog } from '@/components/ActivityLog';
import {
  fetchLogDates,
  fetchLogByDate,
  type ActivityLog as ActivityLogType,
} from '@/lib/api';

export default function LogsPage() {
  const [dates, setDates] = useState<{ date: string; filepath: string }[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [log, setLog] = useState<ActivityLogType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDates = async () => {
      try {
        const data = await fetchLogDates();
        setDates(data);
        if (data.length > 0) {
          setSelectedDate(data[0].date);
        }
      } catch (err) {
        console.error('Failed to load log dates:', err);
      } finally {
        setLoading(false);
      }
    };

    loadDates();
  }, []);

  useEffect(() => {
    if (!selectedDate) return;

    const loadLog = async () => {
      try {
        const data = await fetchLogByDate(selectedDate);
        setLog(data);
      } catch (err) {
        console.error('Failed to load log:', err);
      }
    };

    loadLog();
  }, [selectedDate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-500 dark:text-slate-400">Loading...</div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-8">Activity Log</h1>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Date selector */}
        <div>
          <h2 className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-4">Select Date</h2>

          {dates.length === 0 ? (
            <p className="text-slate-500 dark:text-slate-400 text-sm">No activity logs found.</p>
          ) : (
            <div className="space-y-1">
              {dates.map((item) => (
                <button
                  key={item.date}
                  onClick={() => setSelectedDate(item.date)}
                  className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                    selectedDate === item.date
                      ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-300'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {new Date(item.date).toLocaleDateString('en-US', {
                    weekday: 'short',
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Log content */}
        <div className="lg:col-span-3">
          {log ? (
            <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
              <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-6">
                {new Date(log.date).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </h2>

              <ActivityLog log={log} />
            </div>
          ) : (
            <div className="text-center py-12 text-slate-500 dark:text-slate-400">
              Select a date to view activity
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
