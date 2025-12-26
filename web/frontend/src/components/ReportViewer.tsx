'use client';

import { type Report, formatDate, getTypeColor } from '@/lib/api';
import { MarkdownRenderer } from './MarkdownRenderer';

interface ReportViewerProps {
  report: Report;
}

export function ReportViewer({ report }: ReportViewerProps) {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'youtube': return '🎬';
      case 'article': return '📰';
      case 'paper': return '📚';
      default: return '📝';
    }
  };

  return (
    <article>
      {/* Header */}
      <header className="mb-8 pb-6 border-b border-slate-200 dark:border-slate-700">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">
          {report.title}
        </h1>

        <div className="flex flex-wrap items-center gap-4 text-sm">
          <span className={`px-3 py-1 rounded-full inline-flex items-center gap-1 ${getTypeColor(report.content_type)}`}>
            <span>{getTypeIcon(report.content_type)}</span>
            {report.content_type}
          </span>

          <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <span>📅</span>
            {formatDate(report.created_at)}
          </span>

          {report.word_count && (
            <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <span>📊</span>
              {report.word_count.toLocaleString()} words
            </span>
          )}
        </div>

        {report.source_url && (
          <div className="mt-4">
            <a
              href={report.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300 text-sm transition-colors"
            >
              <span>🔗</span>
              View Original Source
              <span>→</span>
            </a>
          </div>
        )}
      </header>

      {/* Markdown Content */}
      <div className="max-w-none">
        {report.content ? (
          <MarkdownRenderer content={report.content} />
        ) : (
          <div className="text-center py-12 text-slate-500 dark:text-slate-400">
            <p>Report content could not be loaded.</p>
          </div>
        )}
      </div>
    </article>
  );
}
