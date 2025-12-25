'use client';

import { useEffect, useState } from 'react';
import { ReportCard } from '@/components/ReportCard';
import { ActivityLog } from '@/components/ActivityLog';
import { AnalysisForm } from '@/components/AnalysisForm';
import {
  fetchRecentReports,
  fetchTodayLog,
  type Report,
  type ActivityLog as ActivityLogType,
} from '@/lib/api';

export default function Dashboard() {
  const [recentReports, setRecentReports] = useState<Report[]>([]);
  const [todayLog, setTodayLog] = useState<ActivityLogType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [reports, log] = await Promise.all([
        fetchRecentReports(5),
        fetchTodayLog(),
      ]);
      setRecentReports(reports);
      setTodayLog(log);
      setError(null);
    } catch (err) {
      setError('Failed to load data. Make sure the backend is running.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-500">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-700">{error}</p>
        <button
          onClick={loadData}
          className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-900 mb-8">Dashboard</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main content - Recent Reports */}
        <div className="lg:col-span-2">
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-slate-800 mb-4">
              Quick Analyze
            </h2>
            <AnalysisForm onComplete={loadData} />
          </div>

          <h2 className="text-xl font-semibold text-slate-800 mb-4">
            Recent Reports
          </h2>

          {recentReports.length === 0 ? (
            <p className="text-slate-500">No reports yet. Analyze some content to get started!</p>
          ) : (
            <div className="space-y-4">
              {recentReports.map((report) => (
                <ReportCard key={report.id} report={report} />
              ))}
            </div>
          )}
        </div>

        {/* Sidebar - Today's Activity */}
        <div>
          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">
              Today&apos;s Activity
            </h2>
            {todayLog ? (
              <ActivityLog log={todayLog} compact />
            ) : (
              <p className="text-slate-500 text-sm">No activity today.</p>
            )}
          </div>

          <div className="mt-6 bg-slate-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-slate-700 mb-2">
              CLI Commands
            </h3>
            <div className="text-xs text-slate-600 space-y-1 font-mono">
              <p>/yt &lt;url&gt; - YouTube</p>
              <p>/read &lt;url&gt; - Article</p>
              <p>/arxiv &lt;url&gt; - Paper</p>
              <p>/log - Activity</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
