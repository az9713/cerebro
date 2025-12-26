'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ReportViewer } from '@/components/ReportViewer';
import { fetchReport, type Report } from '@/lib/api';

export default function ReportDetailPage() {
  const params = useParams();
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadReport = async () => {
      if (!params.id) return;

      setLoading(true);
      try {
        const data = await fetchReport(Number(params.id));
        setReport(data);
        setError(null);
      } catch (err) {
        setError('Failed to load report');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadReport();
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-500 dark:text-slate-400">Loading...</div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 dark:text-red-400 mb-4">{error || 'Report not found'}</p>
        <Link href="/reports" className="text-primary-600 dark:text-primary-400 hover:underline">
          Back to Reports
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/reports"
          className="text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 text-sm"
        >
          ← Back to Reports
        </Link>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-8">
        <ReportViewer report={report} />
      </div>
    </div>
  );
}
