'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { type Report, formatDate, getTypeColor } from '@/lib/api';

interface ReportViewerProps {
  report: Report;
}

export function ReportViewer({ report }: ReportViewerProps) {
  return (
    <article>
      {/* Header */}
      <header className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <span className={`px-3 py-1 rounded-full text-sm ${getTypeColor(report.content_type)}`}>
            {report.content_type}
          </span>
          <span className="text-slate-500">{formatDate(report.created_at)}</span>
          {report.word_count && (
            <span className="text-slate-500">{report.word_count.toLocaleString()} words</span>
          )}
        </div>

        {report.source_url && (
          <a
            href={report.source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary-600 hover:text-primary-800 text-sm"
          >
            View Original Source →
          </a>
        )}
      </header>

      {/* Markdown Content */}
      <div className="prose max-w-none">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {report.content || ''}
        </ReactMarkdown>
      </div>
    </article>
  );
}
