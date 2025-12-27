'use client';

import { useEffect, useState, useCallback } from 'react';
import { ReportCard, ReportCardSkeleton } from '@/components/ReportCard';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { MoveCategoryDialog } from '@/components/MoveCategoryDialog';
import { useToast } from '@/components/Toast';
import {
  fetchReports,
  deleteReport,
  bulkDeleteReports,
  moveReportCategory,
  type Report,
  type ContentType,
} from '@/lib/api';

const CONTENT_TYPES = [
  { value: '', label: 'All', color: 'bg-[var(--text-tertiary)]' },
  { value: 'youtube', label: 'YouTube', color: 'bg-type-youtube' },
  { value: 'article', label: 'Articles', color: 'bg-type-article' },
  { value: 'paper', label: 'Papers', color: 'bg-type-paper' },
  { value: 'other', label: 'Other', color: 'bg-type-other' },
];

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [contentType, setContentType] = useState('');
  const [loading, setLoading] = useState(true);

  // Selection mode state
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  // Dialog state
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [reportToDelete, setReportToDelete] = useState<Report | null>(null);
  const [bulkDeleteConfirmOpen, setBulkDeleteConfirmOpen] = useState(false);
  const [moveDialogOpen, setMoveDialogOpen] = useState(false);
  const [reportToMove, setReportToMove] = useState<Report | null>(null);

  const { showToast } = useToast();
  const pageSize = 20;

  const loadReports = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchReports(contentType || undefined, page, pageSize);
      setReports(data.items);
      setTotal(data.total);
    } catch (err) {
      console.error('Failed to load reports:', err);
      showToast('Failed to load reports', 'error');
    } finally {
      setLoading(false);
    }
  }, [contentType, page, showToast]);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Escape - exit selection mode
      if (e.key === 'Escape' && selectionMode) {
        setSelectionMode(false);
        setSelectedIds(new Set());
        return;
      }

      // Delete - delete selected reports
      if (e.key === 'Delete' && selectionMode && selectedIds.size > 0) {
        e.preventDefault();
        setBulkDeleteConfirmOpen(true);
        return;
      }

      // Ctrl+A - select all visible reports
      if (e.key === 'a' && (e.ctrlKey || e.metaKey) && selectionMode) {
        e.preventDefault();
        setSelectedIds(new Set(reports.map((r) => r.id)));
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectionMode, selectedIds, reports]);

  const totalPages = Math.ceil(total / pageSize);

  // Selection handlers
  const handleSelect = (id: number, selected: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (selected) {
        next.add(id);
      } else {
        next.delete(id);
      }
      return next;
    });
  };

  const toggleSelectionMode = () => {
    if (selectionMode) {
      setSelectedIds(new Set());
    }
    setSelectionMode(!selectionMode);
  };

  // Delete handlers
  const handleDeleteClick = (report: Report) => {
    setReportToDelete(report);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!reportToDelete) return;

    try {
      await deleteReport(reportToDelete.id);
      showToast('Report deleted', 'success');
      setDeleteConfirmOpen(false);
      setReportToDelete(null);
      loadReports();
    } catch (err) {
      console.error('Failed to delete report:', err);
      showToast('Failed to delete report', 'error');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;

    try {
      const result = await bulkDeleteReports(Array.from(selectedIds));
      if (result.errors.length > 0) {
        showToast(`Deleted ${result.deleted.length} reports, ${result.errors.length} failed`, 'error');
      } else {
        showToast(`${result.deleted.length} reports deleted`, 'success');
      }
      setBulkDeleteConfirmOpen(false);
      setSelectedIds(new Set());
      setSelectionMode(false);
      loadReports();
    } catch (err) {
      console.error('Failed to delete reports:', err);
      showToast('Failed to delete reports', 'error');
    }
  };

  // Move handlers
  const handleMoveClick = (report: Report) => {
    setReportToMove(report);
    setMoveDialogOpen(true);
  };

  const handleConfirmMove = async (newCategory: ContentType) => {
    if (!reportToMove) return;

    try {
      await moveReportCategory(reportToMove.id, newCategory);
      showToast(`Report moved to ${newCategory}`, 'success');
      setMoveDialogOpen(false);
      setReportToMove(null);
      loadReports();
    } catch (err) {
      console.error('Failed to move report:', err);
      showToast('Failed to move report', 'error');
    }
  };

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-10">
        <h1 className="font-display text-hero font-bold text-[var(--text-primary)] leading-tight">
          Reports
        </h1>
        <p className="mt-2 text-lg text-[var(--text-secondary)]">
          Your library of analyzed content.
        </p>
      </div>

      {/* Filters and Actions */}
      <div className="flex flex-wrap items-center gap-4 mb-8">
        <div className="flex gap-2">
          {CONTENT_TYPES.map((type) => (
            <button
              key={type.value}
              onClick={() => {
                setContentType(type.value);
                setPage(1);
              }}
              className={`
                px-4 py-2 text-sm rounded-lg font-medium
                transition-all duration-150
                ${
                  contentType === type.value
                    ? 'bg-[var(--accent-primary)] text-white'
                    : 'bg-[var(--bg-card)] text-[var(--text-secondary)] border border-[var(--border-light)] hover:border-[var(--border-medium)]'
                }
              `}
            >
              {type.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 ml-auto">
          <span className="text-sm text-[var(--text-tertiary)]">
            {total} report{total !== 1 ? 's' : ''}
          </span>

          <button
            onClick={toggleSelectionMode}
            className={`
              px-4 py-2 text-sm rounded-lg font-medium
              transition-all duration-150
              ${
                selectionMode
                  ? 'bg-[var(--accent-primary)] text-white'
                  : 'bg-[var(--bg-card)] text-[var(--text-secondary)] border border-[var(--border-light)] hover:border-[var(--border-medium)]'
              }
            `}
          >
            {selectionMode ? 'Cancel' : 'Select'}
          </button>
        </div>
      </div>

      {/* Selection Action Bar */}
      {selectionMode && selectedIds.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-4 px-6 py-3 bg-[var(--bg-card)] border border-[var(--border-medium)] rounded-lg shadow-lg animate-slide-up">
          <span className="text-sm font-medium text-[var(--text-primary)]">
            {selectedIds.size} selected
          </span>
          <div className="w-px h-5 bg-[var(--border-medium)]" />
          <button
            onClick={() => setBulkDeleteConfirmOpen(true)}
            className="px-4 py-1.5 text-sm font-medium rounded-md bg-red-600 text-white hover:bg-red-700 transition-colors"
          >
            Delete
          </button>
          <button
            onClick={() => {
              setSelectedIds(new Set());
              setSelectionMode(false);
            }}
            className="px-4 py-1.5 text-sm font-medium rounded-md text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Reports Grid */}
      {loading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {[...Array(6)].map((_, i) => (
            <ReportCardSkeleton key={i} />
          ))}
        </div>
      ) : reports.length === 0 ? (
        <div className="bg-[var(--bg-secondary)] rounded-xl p-12 text-center">
          <svg className="w-16 h-16 mx-auto mb-4 text-[var(--text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-[var(--text-secondary)] text-lg">No reports found.</p>
          <p className="text-sm text-[var(--text-tertiary)] mt-1">
            {contentType ? 'Try a different filter or analyze some content.' : 'Start by analyzing some content.'}
          </p>
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2">
            {reports.map((report, i) => (
              <div key={report.id} className={`animate-slide-up stagger-${Math.min(i + 1, 5)}`}>
                <ReportCard
                  report={report}
                  selectionMode={selectionMode}
                  isSelected={selectedIds.has(report.id)}
                  onSelect={handleSelect}
                  onDelete={handleDeleteClick}
                  onMove={handleMoveClick}
                />
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 mt-10">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="
                  px-5 py-2.5 rounded-lg font-medium
                  bg-[var(--bg-card)] text-[var(--text-secondary)]
                  border border-[var(--border-light)]
                  hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)]
                  disabled:opacity-50 disabled:cursor-not-allowed
                  transition-all duration-150
                "
              >
                Previous
              </button>

              <span className="px-4 py-2 text-sm text-[var(--text-tertiary)]">
                Page {page} of {totalPages}
              </span>

              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="
                  px-5 py-2.5 rounded-lg font-medium
                  bg-[var(--bg-card)] text-[var(--text-secondary)]
                  border border-[var(--border-light)]
                  hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)]
                  disabled:opacity-50 disabled:cursor-not-allowed
                  transition-all duration-150
                "
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        title="Delete Report?"
        message={`This will permanently delete "${reportToDelete?.title}". This cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setDeleteConfirmOpen(false);
          setReportToDelete(null);
        }}
      />

      {/* Bulk Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={bulkDeleteConfirmOpen}
        title={`Delete ${selectedIds.size} Reports?`}
        message={`This will permanently delete ${selectedIds.size} selected reports. This cannot be undone.`}
        confirmLabel="Delete All"
        variant="danger"
        onConfirm={handleBulkDelete}
        onCancel={() => setBulkDeleteConfirmOpen(false)}
      />

      {/* Move Category Dialog */}
      <MoveCategoryDialog
        isOpen={moveDialogOpen}
        currentCategory={reportToMove?.content_type as ContentType || 'other'}
        onMove={handleConfirmMove}
        onCancel={() => {
          setMoveDialogOpen(false);
          setReportToMove(null);
        }}
      />
    </div>
  );
}
