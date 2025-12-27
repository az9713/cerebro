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
        <div className="text-[var(--text-tertiary)]">Loading...</div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-10">
        <h1 className="font-display text-hero font-bold text-[var(--text-primary)] leading-tight">
          Activity Log
        </h1>
        <p className="mt-2 text-lg text-[var(--text-secondary)]">
          Track your daily content consumption.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Date Selector */}
        <div>
          <h2 className="text-sm font-medium text-[var(--text-tertiary)] uppercase tracking-wide mb-4">
            Select Date
          </h2>

          {dates.length === 0 ? (
            <p className="text-[var(--text-muted)] text-sm">No activity logs found.</p>
          ) : (
            <div className="space-y-1">
              {dates.map((item) => (
                <button
                  key={item.date}
                  onClick={() => setSelectedDate(item.date)}
                  className={`
                    w-full text-left px-4 py-3 rounded-lg transition-all duration-150
                    ${
                      selectedDate === item.date
                        ? 'bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] font-medium'
                        : 'hover:bg-[var(--bg-secondary)] text-[var(--text-secondary)]'
                    }
                  `}
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

        {/* Log Content */}
        <div className="lg:col-span-3">
          {log ? (
            <div className="bg-[var(--bg-card)] rounded-xl p-6 shadow-card">
              <h2 className="font-display text-h2 font-bold text-[var(--text-primary)] mb-6">
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
            <div className="bg-[var(--bg-secondary)] rounded-xl p-12 text-center">
              <svg className="w-16 h-16 mx-auto mb-4 text-[var(--text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-[var(--text-secondary)]">Select a date to view activity</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
