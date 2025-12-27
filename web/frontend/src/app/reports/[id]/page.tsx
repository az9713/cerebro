'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ReportViewer } from '@/components/ReportViewer';
import { AudioPlayer } from '@/components/AudioPlayer';
import CredibilityPanel from '@/components/CredibilityPanel';
import TranslationPanel from '@/components/TranslationPanel';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { MoveCategoryDialog } from '@/components/MoveCategoryDialog';
import { useToast } from '@/components/Toast';
import { fetchReport, deleteReport, moveReportCategory, type Report, type ContentType } from '@/lib/api';

// Icons
const TrashIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const MoveIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
  </svg>
);

export default function ReportDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { showToast } = useToast();

  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Dialog state
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [moveDialogOpen, setMoveDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

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

  const handleConfirmDelete = async () => {
    if (!report) return;

    setIsDeleting(true);
    try {
      await deleteReport(report.id);
      showToast('Report deleted', 'success');
      router.push('/reports');
    } catch (err) {
      console.error('Failed to delete report:', err);
      showToast('Failed to delete report', 'error');
      setIsDeleting(false);
      setDeleteConfirmOpen(false);
    }
  };

  const handleConfirmMove = async (newCategory: ContentType) => {
    if (!report) return;

    try {
      await moveReportCategory(report.id, newCategory);
      showToast(`Report moved to ${newCategory}`, 'success');
      setMoveDialogOpen(false);
      // Reload report to get updated data
      const updatedReport = await fetchReport(report.id);
      setReport(updatedReport);
    } catch (err) {
      console.error('Failed to move report:', err);
      showToast('Failed to move report', 'error');
    }
  };

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
      {/* Header with back link and actions */}
      <div className="mb-6 flex items-center justify-between">
        <Link
          href="/reports"
          className="text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 text-sm"
        >
          ← Back to Reports
        </Link>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMoveDialogOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg border border-[var(--border-light)] text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)] transition-colors"
          >
            <MoveIcon />
            Move
          </button>
          <button
            onClick={() => setDeleteConfirmOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors"
          >
            <TrashIcon />
            Delete
          </button>
        </div>
      </div>

      {/* Tools Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {/* Audio Player */}
        <div className="lg:col-span-1">
          <AudioPlayer reportId={report.id} />
        </div>

        {/* Credibility Analysis */}
        <div className="lg:col-span-1">
          <CredibilityPanel reportId={report.id} />
        </div>

        {/* Translation */}
        <div className="lg:col-span-1">
          <TranslationPanel reportId={report.id} />
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-8">
        <ReportViewer report={report} />
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        title="Delete Report?"
        message={`This will permanently delete "${report.title}". This cannot be undone.`}
        confirmLabel={isDeleting ? 'Deleting...' : 'Delete'}
        variant="danger"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteConfirmOpen(false)}
      />

      {/* Move Category Dialog */}
      <MoveCategoryDialog
        isOpen={moveDialogOpen}
        currentCategory={report.content_type as ContentType}
        onMove={handleConfirmMove}
        onCancel={() => setMoveDialogOpen(false)}
      />
    </div>
  );
}
