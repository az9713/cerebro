'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ReportCard, ReportCardSkeleton } from '@/components/ReportCard';
import { ActivityLog } from '@/components/ActivityLog';
import { AnalysisForm } from '@/components/AnalysisForm';
import {
  fetchRecentReports,
  fetchTodayLog,
  type Report,
  type ActivityLog as ActivityLogType,
} from '@/lib/api';

// Stat card component
function StatCard({
  label,
  value,
  subtext,
}: {
  label: string;
  value: string | number;
  subtext?: string;
}) {
  return (
    <div className="bg-[var(--bg-card)] rounded-xl p-5 shadow-card">
      <p className="text-sm text-[var(--text-tertiary)] mb-1">{label}</p>
      <p className="text-2xl font-display font-bold text-[var(--text-primary)]">{value}</p>
      {subtext && <p className="text-xs text-[var(--text-muted)] mt-1">{subtext}</p>}
    </div>
  );
}

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

  // Calculate stats
  const todayCount = todayLog
    ? todayLog.videos.length + todayLog.articles.length + todayLog.papers.length + todayLog.other.length
    : 0;

  if (error) {
    return (
      <div className="animate-fade-in">
        <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800/50 rounded-xl p-6">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-red-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <p className="text-red-800 dark:text-red-300 font-medium">{error}</p>
              <button
                onClick={loadData}
                className="mt-2 text-sm text-[var(--accent-primary)] hover:text-[var(--accent-hover)] underline underline-offset-2"
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* Hero Section */}
      <div className="mb-10">
        <h1 className="font-display text-hero font-bold text-[var(--text-primary)] leading-tight">
          Welcome back
        </h1>
        <p className="mt-2 text-lg text-[var(--text-secondary)]">
          Your personal knowledge system is ready.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <StatCard
          label="Today"
          value={todayCount}
          subtext="items consumed"
        />
        <StatCard
          label="Total Reports"
          value={loading ? '—' : recentReports.length > 0 ? '16+' : '0'}
          subtext="in your library"
        />
        <StatCard
          label="This Week"
          value={loading ? '—' : todayCount}
          subtext="active days"
        />
        <StatCard
          label="Streak"
          value={todayCount > 0 ? '1' : '0'}
          subtext="days in a row"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-10">
          {/* Quick Analyze */}
          <section>
            <h2 className="font-display text-h2 font-bold text-[var(--text-primary)] mb-5">
              Quick Analyze
            </h2>
            <AnalysisForm onComplete={loadData} />
          </section>

          {/* Recent Reports */}
          <section>
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display text-h2 font-bold text-[var(--text-primary)]">
                Recent Reports
              </h2>
              <Link
                href="/reports"
                className="text-sm text-[var(--accent-primary)] hover:text-[var(--accent-hover)] transition-colors"
              >
                View all
              </Link>
            </div>

            {loading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <ReportCardSkeleton key={i} />
                ))}
              </div>
            ) : recentReports.length === 0 ? (
              <div className="bg-[var(--bg-secondary)] rounded-xl p-8 text-center">
                <svg className="w-12 h-12 mx-auto mb-4 text-[var(--text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-[var(--text-secondary)]">No reports yet.</p>
                <p className="text-sm text-[var(--text-tertiary)] mt-1">
                  Analyze some content to get started!
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentReports.slice(0, 1).map((report) => (
                  <ReportCard key={report.id} report={report} featured />
                ))}
                {recentReports.slice(1).map((report, i) => (
                  <div key={report.id} className={`animate-slide-up stagger-${i + 1}`}>
                    <ReportCard report={report} />
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Today's Activity */}
          <div className="bg-[var(--bg-card)] rounded-xl p-6 shadow-card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-h3 font-bold text-[var(--text-primary)]">
                Today&apos;s Activity
              </h2>
              <Link
                href="/logs"
                className="text-xs text-[var(--accent-primary)] hover:text-[var(--accent-hover)] transition-colors"
              >
                View logs
              </Link>
            </div>
            {loading ? (
              <div className="space-y-3 animate-pulse">
                <div className="h-4 bg-[var(--bg-secondary)] rounded w-3/4" />
                <div className="h-4 bg-[var(--bg-secondary)] rounded w-1/2" />
              </div>
            ) : todayLog && todayCount > 0 ? (
              <ActivityLog log={todayLog} compact />
            ) : (
              <p className="text-[var(--text-tertiary)] text-sm">No activity today yet.</p>
            )}
          </div>

          {/* Quick Links */}
          <div className="bg-[var(--bg-secondary)] rounded-xl p-6">
            <h3 className="text-sm font-medium text-[var(--text-primary)] mb-4">
              Quick Links
            </h3>
            <div className="space-y-2">
              <Link
                href="/discover"
                className="flex items-center gap-3 p-3 rounded-lg bg-[var(--bg-card)] hover:shadow-card transition-all text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              >
                <svg className="w-5 h-5 text-[var(--accent-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                <span className="text-sm font-medium">Discover Recommendations</span>
              </Link>
              <Link
                href="/qa"
                className="flex items-center gap-3 p-3 rounded-lg bg-[var(--bg-card)] hover:shadow-card transition-all text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              >
                <svg className="w-5 h-5 text-[var(--accent-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm font-medium">Ask Your Knowledge</span>
              </Link>
              <Link
                href="/review"
                className="flex items-center gap-3 p-3 rounded-lg bg-[var(--bg-card)] hover:shadow-card transition-all text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              >
                <svg className="w-5 h-5 text-[var(--accent-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <span className="text-sm font-medium">Review Flashcards</span>
              </Link>
            </div>
          </div>

          {/* CLI Reference */}
          <div className="bg-[var(--bg-secondary)] rounded-xl p-6">
            <h3 className="text-sm font-medium text-[var(--text-primary)] mb-3">
              CLI Commands
            </h3>
            <div className="text-xs text-[var(--text-secondary)] space-y-1.5 font-mono">
              <p><span className="text-[var(--accent-primary)]">/yt</span> &lt;url&gt; — YouTube</p>
              <p><span className="text-[var(--accent-primary)]">/read</span> &lt;url&gt; — Article</p>
              <p><span className="text-[var(--accent-primary)]">/arxiv</span> &lt;url&gt; — Paper</p>
              <p><span className="text-[var(--accent-primary)]">/log</span> — Activity</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
