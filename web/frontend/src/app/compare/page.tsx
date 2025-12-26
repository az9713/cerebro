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

  const getReportById = (id: number) => reports.find((r) => r.id === id);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
          Compare Content
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">
          Select two reports to compare and discover similarities, differences, and unique insights
        </p>
      </div>

      {/* Selection Panel */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-[1fr,auto,1fr] gap-4 items-end">
          {/* Report A */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              First Report
            </label>
            <select
              value={reportA ?? ''}
              onChange={(e) => setReportA(e.target.value ? Number(e.target.value) : null)}
              disabled={loadingReports}
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
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
            className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Swap reports"
          >
            ⇄
          </button>

          {/* Report B */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Second Report
            </label>
            <select
              value={reportB ?? ''}
              onChange={(e) => setReportB(e.target.value ? Number(e.target.value) : null)}
              disabled={loadingReports}
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
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

        <div className="flex items-center justify-between mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Model:
            </label>
            <select
              value={model}
              onChange={(e) => setModel(e.target.value as ModelKey)}
              className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="haiku">Haiku (Fast)</option>
              <option value="sonnet">Sonnet (Balanced)</option>
              <option value="opus">Opus (Best)</option>
            </select>
          </div>

          <button
            onClick={handleCompare}
            disabled={!reportA || !reportB || loading}
            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Comparing...' : 'Compare'}
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-8 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300">
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-8">
          <div className="flex flex-col items-center justify-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-primary-600 rounded-full animate-bounce" />
              <div className="w-3 h-3 bg-primary-600 rounded-full animate-bounce [animation-delay:0.2s]" />
              <div className="w-3 h-3 bg-primary-600 rounded-full animate-bounce [animation-delay:0.4s]" />
            </div>
            <p className="text-slate-600 dark:text-slate-400">
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
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="text-xs text-blue-600 dark:text-blue-400 uppercase font-semibold mb-1">
                Report A
              </div>
              <Link
                href={`/reports/${result.report_a.id}`}
                className="text-lg font-semibold text-slate-900 dark:text-slate-100 hover:text-primary-600 dark:hover:text-primary-400"
              >
                {result.report_a.title}
              </Link>
              <div className="text-sm text-slate-600 dark:text-slate-400 capitalize mt-1">
                {result.report_a.content_type}
              </div>
            </div>

            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <div className="text-xs text-green-600 dark:text-green-400 uppercase font-semibold mb-1">
                Report B
              </div>
              <Link
                href={`/reports/${result.report_b.id}`}
                className="text-lg font-semibold text-slate-900 dark:text-slate-100 hover:text-primary-600 dark:hover:text-primary-400"
              >
                {result.report_b.title}
              </Link>
              <div className="text-sm text-slate-600 dark:text-slate-400 capitalize mt-1">
                {result.report_b.content_type}
              </div>
            </div>
          </div>

          {/* Comparison Content */}
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-6">
            <div className="prose prose-slate dark:prose-invert max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {result.comparison}
              </ReactMarkdown>
            </div>

            {/* Usage Info */}
            <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700 text-sm text-slate-500 dark:text-slate-400">
              {result.model && <span>{result.model}</span>}
              {result.tokens_used && <span> • {result.tokens_used} tokens</span>}
              {result.cost && <span> • ${result.cost.toFixed(4)}</span>}
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && !result && !error && (
        <div className="text-center py-12 text-slate-500 dark:text-slate-400">
          <p>Select two reports above to compare them</p>
        </div>
      )}
    </div>
  );
}
