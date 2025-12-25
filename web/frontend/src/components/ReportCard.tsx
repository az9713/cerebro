import Link from 'next/link';
import { type Report, formatDate, getTypeColor } from '@/lib/api';

interface ReportCardProps {
  report: Report;
  compact?: boolean;
}

export function ReportCard({ report, compact = false }: ReportCardProps) {
  return (
    <Link
      href={`/reports/${report.id}`}
      className="block bg-white rounded-lg border border-slate-200 p-4 hover:border-primary-300 hover:shadow-md transition-all"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-slate-900 truncate">
            {report.title}
          </h3>

          {!compact && report.summary && (
            <p className="mt-1 text-sm text-slate-600 line-clamp-2">
              {report.summary}
            </p>
          )}

          <div className="mt-2 flex items-center gap-3 text-xs text-slate-500">
            <span className={`px-2 py-0.5 rounded-full ${getTypeColor(report.content_type)}`}>
              {report.content_type}
            </span>
            <span>{formatDate(report.created_at)}</span>
            {report.word_count && (
              <span>{report.word_count.toLocaleString()} words</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
