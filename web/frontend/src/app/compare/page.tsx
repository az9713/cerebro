'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  fetchReports,
  compareReports,
  type Report,
  type ComparisonResult,
  type ModelKey,
} from '@/lib/api';

export default function ComparePage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [reportA, setReportA] = useState<number | null>(null);
  const [reportB, setReportB] = useState<number | null>(null);
  const [model, setModel] = useState<ModelKey>('sonnet');
  const [loading, setLoading] = useState(false);
  const [loadingReports, setLoadingReports] = useState(true);
  const [result, setResult] = useState<ComparisonResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Load all reports for selection
  useEffect(() => {
    const loadReports = async () => {
      try {
        const data = await fetchReports(undefined, 1, 100);
        setReports(data.items);
      } catch (err) {
        console.error('Failed to load reports:', err);
      } finally {
        setLoadingReports(false);
      }
    };
    loadReports();
  }, []);

  const handleCompare = async () => {
    if (!reportA || !reportB) return;
    if (reportA === reportB) {
      setError('Please select two different reports to compare');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const comparison = await compareReports(reportA, reportB, model);
      setResult(comparison);
    } catch (err) {
      console.error('Comparison failed:', err);
      setError('Failed to compare reports. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const swapReports = () => {
    const temp = reportA;
    setReportA(reportB);
    setReportB(temp);
  };

  return (
    <div className="max-w-6xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="mb-10">
        <h1 className="font-display text-hero font-bold text-[var(--text-primary)] leading-tight">
          Compare Content
        </h1>
        <p className="mt-2 text-lg text-[var(--text-secondary)]">
          Select two reports to compare and discover similarities, differences, and unique insights.
        </p>
      </div>

      {/* Selection Panel */}
      <div className="bg-[var(--bg-card)] rounded-xl p-6 shadow-card mb-8">
        <div className="grid grid-cols-1 md:grid-cols-[1fr,auto,1fr] gap-4 items-end">
          {/* Report A */}
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
              First Report
            </label>
            <select
              value={reportA ?? ''}
              onChange={(e) => setReportA(e.target.value ? Number(e.target.value) : null)}
              disabled={loadingReports}
              className="
                w-full px-4 py-3
                bg-[var(--bg-primary)]
                border border-[var(--border-light)]
                rounded-xl
                text-[var(--text-primary)]
                focus:outline-none focus:border-[var(--accent-primary)]
                focus:ring-2 focus:ring-[var(--accent-primary)]/10
                transition-all duration-150
              "
            >
              <option value="">Select a report...</option>
              {reports.map((report) => (
                <option key={report.id} value={report.id} disabled={report.id === reportB}>
                  [{report.content_type}] {report.title}
                </option>
              ))}
            </select>
          </div>

          {/* Swap Button */}
          <button
            onClick={swapReports}
            disabled={!reportA || !reportB}
            className="
              p-3 rounded-lg
              text-[var(--text-tertiary)] hover:text-[var(--text-primary)]
              hover:bg-[var(--bg-secondary)]
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-all duration-150
            "
            title="Swap reports"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
          </button>

          {/* Report B */}
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
              Second Report
            </label>
            <select
              value={reportB ?? ''}
              onChange={(e) => setReportB(e.target.value ? Number(e.target.value) : null)}
              disabled={loadingReports}
              className="
                w-full px-4 py-3
                bg-[var(--bg-primary)]
                border border-[var(--border-light)]
                rounded-xl
                text-[var(--text-primary)]
                focus:outline-none focus:border-[var(--accent-primary)]
                focus:ring-2 focus:ring-[var(--accent-primary)]/10
                transition-all duration-150
              "
            >
              <option value="">Select a report...</option>
              {reports.map((report) => (
                <option key={report.id} value={report.id} disabled={report.id === reportA}>
                  [{report.content_type}] {report.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between mt-6 pt-6 border-t border-[var(--border-light)]">
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-[var(--text-secondary)]">Model:</label>
            <select
              value={model}
              onChange={(e) => setModel(e.target.value as ModelKey)}
              className="
                px-3 py-2
                bg-[var(--bg-primary)]
                border border-[var(--border-light)]
                rounded-lg
                text-[var(--text-primary)] text-sm
                focus:outline-none focus:border-[var(--accent-primary)]
                focus:ring-2 focus:ring-[var(--accent-primary)]/10
              "
            >
              <option value="haiku">Haiku (Fast)</option>
              <option value="sonnet">Sonnet (Balanced)</option>
              <option value="opus">Opus (Best)</option>
            </select>
          </div>

          <button
            onClick={handleCompare}
            disabled={!reportA || !reportB || loading}
            className="
              px-6 py-2.5
              bg-[var(--accent-primary)] text-white
              rounded-xl font-medium
              hover:bg-[var(--accent-hover)]
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-all duration-150
              active:scale-[0.98]
            "
          >
            {loading ? 'Comparing...' : 'Compare'}
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-8 p-4 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800/50 rounded-xl text-red-700 dark:text-red-300">
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="bg-[var(--bg-card)] rounded-xl p-8 shadow-card">
          <div className="flex flex-col items-center justify-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-[var(--accent-primary)] rounded-full animate-bounce" />
              <div className="w-3 h-3 bg-[var(--accent-primary)] rounded-full animate-bounce [animation-delay:0.2s]" />
              <div className="w-3 h-3 bg-[var(--accent-primary)] rounded-full animate-bounce [animation-delay:0.4s]" />
            </div>
            <p className="text-[var(--text-secondary)]">
              Analyzing and comparing content...
            </p>
          </div>
        </div>
      )}

      {/* Comparison Result */}
      {result && (
        <div className="space-y-6">
          {/* Report Headers */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-[var(--accent-primary)]/10 border border-[var(--accent-primary)]/20 rounded-xl p-4">
              <div className="text-xs text-[var(--accent-primary)] uppercase font-semibold mb-1">
                Report A
              </div>
              <Link
                href={`/reports/${result.report_a.id}`}
                className="font-display font-bold text-lg text-[var(--text-primary)] hover:text-[var(--accent-primary)] transition-colors"
              >
                {result.report_a.title}
              </Link>
              <div className="text-sm text-[var(--text-secondary)] capitalize mt-1">
                {result.report_a.content_type}
              </div>
            </div>

            <div className="bg-sage-500/10 border border-sage-500/20 rounded-xl p-4">
              <div className="text-xs text-sage-600 dark:text-sage-400 uppercase font-semibold mb-1">
                Report B
              </div>
              <Link
                href={`/reports/${result.report_b.id}`}
                className="font-display font-bold text-lg text-[var(--text-primary)] hover:text-sage-600 dark:hover:text-sage-400 transition-colors"
              >
                {result.report_b.title}
              </Link>
              <div className="text-sm text-[var(--text-secondary)] capitalize mt-1">
                {result.report_b.content_type}
              </div>
            </div>
          </div>

          {/* Comparison Content */}
          <div className="bg-[var(--bg-card)] rounded-xl p-6 shadow-card">
            <div className="prose prose-stone dark:prose-invert max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {result.comparison}
              </ReactMarkdown>
            </div>

            {/* Usage Info */}
            <div className="mt-6 pt-4 border-t border-[var(--border-light)] text-sm text-[var(--text-muted)]">
              {result.model && <span>{result.model}</span>}
              {result.tokens_used && <span> • {result.tokens_used} tokens</span>}
              {result.cost && <span> • ${result.cost.toFixed(4)}</span>}
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && !result && !error && (
        <div className="bg-[var(--bg-secondary)] rounded-xl p-12 text-center">
          <svg className="w-16 h-16 mx-auto mb-4 text-[var(--text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <p className="text-[var(--text-secondary)]">Select two reports above to compare them</p>
        </div>
      )}
    </div>
  );
}
