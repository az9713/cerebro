'use client';

import { type Report, formatDate, getTypeColor } from '@/lib/api';
import { MarkdownRenderer } from './MarkdownRenderer';

interface ReportViewerProps {
  report: Report;
}

// Capitalize first letter
function formatContentType(type: string): string {
  return type.charAt(0).toUpperCase() + type.slice(1);
}

export function ReportViewer({ report }: ReportViewerProps) {
  return (
    <article className="max-w-prose mx-auto animate-fade-in">
      {/* Header - Editorial style */}
      <header className="mb-12">
        {/* Content type pill */}
        <span
          className={`
            inline-block px-3 py-1 rounded-full
            text-xs font-medium uppercase tracking-wide
            ${getTypeColor(report.content_type)}
          `}
        >
          {formatContentType(report.content_type)}
        </span>

        {/* Title - Large serif */}
        <h1 className="mt-6 font-display text-h1 font-bold text-[var(--text-primary)] leading-tight">
          {report.title}
        </h1>

        {/* Metadata line */}
        <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-[var(--text-tertiary)]">
          <time dateTime={report.created_at}>
            {formatDate(report.created_at)}
          </time>

          {report.word_count && (
            <>
              <span className="w-1 h-1 rounded-full bg-[var(--border-medium)]" />
              <span>{report.word_count.toLocaleString()} words</span>
              <span className="w-1 h-1 rounded-full bg-[var(--border-medium)]" />
              <span>{Math.ceil(report.word_count / 200)} min read</span>
            </>
          )}
        </div>

        {/* Source link */}
        {report.source_url && (
          <a
            href={report.source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="
              mt-6 inline-flex items-center gap-2
              text-sm text-[var(--accent-primary)]
              hover:text-[var(--accent-hover)]
              transition-colors
            "
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            View Original Source
          </a>
        )}

        {/* Divider */}
        <div className="mt-8 border-t border-[var(--border-light)]" />
      </header>

      {/* Markdown Content */}
      <div className="prose">
        {report.content ? (
          <MarkdownRenderer content={report.content} />
        ) : (
          <div className="text-center py-16 text-[var(--text-tertiary)]">
            <svg className="w-12 h-12 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p>Report content could not be loaded.</p>
          </div>
        )}
      </div>

      {/* Footer with source reminder */}
      {report.source_url && (
        <footer className="mt-16 pt-8 border-t border-[var(--border-light)]">
          <p className="text-sm text-[var(--text-tertiary)]">
            Originally from{' '}
            <a
              href={report.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--accent-primary)] hover:text-[var(--accent-hover)] transition-colors"
            >
              {new URL(report.source_url).hostname}
            </a>
          </p>
        </footer>
      )}
    </article>
  );
}
