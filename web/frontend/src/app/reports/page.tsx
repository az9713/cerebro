'use client';

import { useEffect, useState } from 'react';
import { ReportCard } from '@/components/ReportCard';
import { fetchReports, type Report, type ReportList } from '@/lib/api';

const CONTENT_TYPES = [
  { value: '', label: 'All' },
  { value: 'youtube', label: 'YouTube' },
  { value: 'article', label: 'Articles' },
  { value: 'paper', label: 'Papers' },
  { value: 'other', label: 'Other' },
];

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [contentType, setContentType] = useState('');
  const [loading, setLoading] = useState(true);

  const pageSize = 20;

  useEffect(() => {
    const loadReports = async () => {
      setLoading(true);
      try {
        const data = await fetchReports(contentType || undefined, page, pageSize);
        setReports(data.items);
        setTotal(data.total);
      } catch (err) {
        console.error('Failed to load reports:', err);
      } finally {
        setLoading(false);
      }
    };

    loadReports();
  }, [page, contentType]);

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Reports</h1>

        <div className="flex items-center gap-4">
          <select
            value={contentType}
            onChange={(e) => {
              setContentType(e.target.value);
              setPage(1);
            }}
            className="px-4 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            {CONTENT_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>

          <span className="text-sm text-slate-500 dark:text-slate-400">
            {total} report{total !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-slate-500 dark:text-slate-400">Loading...</div>
        </div>
      ) : reports.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-slate-500 dark:text-slate-400">No reports found.</p>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {reports.map((report) => (
              <ReportCard key={report.id} report={report} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-700"
              >
                Previous
              </button>

              <span className="px-4 py-2 text-slate-600 dark:text-slate-300">
                Page {page} of {totalPages}
              </span>

              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-700"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
