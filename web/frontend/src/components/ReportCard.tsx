'use client';

import Link from 'next/link';
import { type Report, formatDate, getTypeColor, ContentType } from '@/lib/api';
import { DropdownMenu } from './DropdownMenu';

interface ReportCardProps {
  report: Report;
  compact?: boolean;
  featured?: boolean;
  selectionMode?: boolean;
  isSelected?: boolean;
  onSelect?: (id: number, selected: boolean) => void;
  onDelete?: (report: Report) => void;
  onMove?: (report: Report) => void;
}

// Capitalize first letter of content type
function formatContentType(type: string): string {
  return type.charAt(0).toUpperCase() + type.slice(1);
}

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

export function ReportCard({
  report,
  compact = false,
  featured = false,
  selectionMode = false,
  isSelected = false,
  onSelect,
  onDelete,
  onMove,
}: ReportCardProps) {
  const showMenu = onDelete || onMove;

  const menuItems = [
    ...(onMove
      ? [
          {
            label: 'Move to...',
            icon: <MoveIcon />,
            onClick: () => onMove(report),
          },
        ]
      : []),
    ...(onDelete
      ? [
          {
            label: 'Delete',
            icon: <TrashIcon />,
            onClick: () => onDelete(report),
            variant: 'danger' as const,
          },
        ]
      : []),
  ];

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    onSelect?.(report.id, e.target.checked);
  };

  const handleCardClick = (e: React.MouseEvent) => {
    if (selectionMode) {
      e.preventDefault();
      onSelect?.(report.id, !isSelected);
    }
  };

  if (featured) {
    return (
      <div className="relative group">
        <Link
          href={`/reports/${report.id}`}
          onClick={handleCardClick}
          className={`
            block
            bg-[var(--bg-card)] rounded-xl
            shadow-card hover:shadow-card-hover
            transition-all duration-200
            hover:-translate-y-0.5
            overflow-hidden
            ${selectionMode && isSelected ? 'ring-2 ring-accent-primary' : ''}
          `}
        >
          <div className="p-8">
            {/* Header with type and menu */}
            <div className="flex items-start justify-between">
              <span
                className={`
                  inline-block px-3 py-1 rounded-full
                  text-xs font-medium uppercase tracking-wide
                  ${getTypeColor(report.content_type)}
                `}
              >
                {formatContentType(report.content_type)}
              </span>

              {/* Selection checkbox or menu */}
              <div className="flex items-center gap-2">
                {selectionMode && (
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={handleCheckboxChange}
                    onClick={(e) => e.stopPropagation()}
                    className="w-5 h-5 rounded border-2 border-border-primary accent-accent-primary"
                  />
                )}
              </div>
            </div>

            {/* Title */}
            <h2 className="mt-4 font-display text-2xl font-bold text-[var(--text-primary)] leading-tight group-hover:text-[var(--accent-primary)] transition-colors">
              {report.title}
            </h2>

            {/* Summary */}
            {report.summary && (
              <p className="mt-3 text-[var(--text-secondary)] line-clamp-3 leading-relaxed">
                {report.summary}
              </p>
            )}

            {/* Metadata */}
            <div className="mt-6 flex items-center gap-4 text-sm text-[var(--text-tertiary)]">
              <span>{formatDate(report.created_at)}</span>
              {report.word_count && (
                <>
                  <span className="w-1 h-1 rounded-full bg-[var(--border-medium)]" />
                  <span>{report.word_count.toLocaleString()} words</span>
                </>
              )}
            </div>
          </div>
        </Link>

        {/* Floating menu button */}
        {showMenu && !selectionMode && (
          <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
            <DropdownMenu items={menuItems} />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative group">
      <Link
        href={`/reports/${report.id}`}
        onClick={handleCardClick}
        className={`
          block
          bg-[var(--bg-card)] rounded-xl
          shadow-card hover:shadow-card-hover
          transition-all duration-200
          hover:-translate-y-0.5
          ${selectionMode && isSelected ? 'ring-2 ring-accent-primary' : ''}
        `}
      >
        <div className={compact ? 'p-4' : 'p-6'}>
          {/* Header with type pill and checkbox */}
          <div className="flex items-start justify-between">
            <span
              className={`
                inline-block px-2.5 py-0.5 rounded-full
                text-xs font-medium uppercase tracking-wide
                ${getTypeColor(report.content_type)}
              `}
            >
              {formatContentType(report.content_type)}
            </span>

            {selectionMode && (
              <input
                type="checkbox"
                checked={isSelected}
                onChange={handleCheckboxChange}
                onClick={(e) => e.stopPropagation()}
                className="w-5 h-5 rounded border-2 border-border-primary accent-accent-primary"
              />
            )}
          </div>

          {/* Title */}
          <h3
            className={`
              mt-3 font-display font-bold text-[var(--text-primary)]
              leading-snug group-hover:text-[var(--accent-primary)] transition-colors
              ${compact ? 'text-base line-clamp-1' : 'text-lg line-clamp-2'}
            `}
          >
            {report.title}
          </h3>

          {/* Summary */}
          {!compact && report.summary && (
            <p className="mt-2 text-sm text-[var(--text-secondary)] line-clamp-2 leading-relaxed">
              {report.summary}
            </p>
          )}

          {/* Metadata */}
          <div className={`flex items-center gap-3 text-xs text-[var(--text-tertiary)] ${compact ? 'mt-2' : 'mt-4'}`}>
            <span>{formatDate(report.created_at)}</span>
            {!compact && report.word_count && (
              <>
                <span className="w-1 h-1 rounded-full bg-[var(--border-medium)]" />
                <span>{report.word_count.toLocaleString()} words</span>
              </>
            )}
          </div>
        </div>
      </Link>

      {/* Floating menu button */}
      {showMenu && !selectionMode && (
        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
          <DropdownMenu items={menuItems} />
        </div>
      )}
    </div>
  );
}

// Skeleton loader for ReportCard
export function ReportCardSkeleton({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`bg-[var(--bg-card)] rounded-xl shadow-card ${compact ? 'p-4' : 'p-6'}`}>
      {/* Type pill skeleton */}
      <div className="skeleton h-5 w-16 rounded-full" />

      {/* Title skeleton */}
      <div className={`skeleton mt-3 h-6 rounded ${compact ? 'w-3/4' : 'w-full'}`} />
      {!compact && <div className="skeleton mt-2 h-6 rounded w-2/3" />}

      {/* Summary skeleton */}
      {!compact && (
        <>
          <div className="skeleton mt-3 h-4 rounded w-full" />
          <div className="skeleton mt-1 h-4 rounded w-4/5" />
        </>
      )}

      {/* Metadata skeleton */}
      <div className={`flex gap-3 ${compact ? 'mt-2' : 'mt-4'}`}>
        <div className="skeleton h-3 w-20 rounded" />
        {!compact && <div className="skeleton h-3 w-16 rounded" />}
      </div>
    </div>
  );
}
