import { type ActivityLog as ActivityLogType, type ActivityLogEntry } from '@/lib/api';

interface ActivityLogProps {
  log: ActivityLogType;
  compact?: boolean;
}

// Icon components for each content type
function VideoIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
  );
}

function ArticleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
    </svg>
  );
}

function PaperIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  );
}

function OtherIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );
}

function LogSection({
  title,
  icon: Icon,
  entries,
  color,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  entries: ActivityLogEntry[];
  color: string;
}) {
  if (entries.length === 0) return null;

  return (
    <div className="mb-4 last:mb-0">
      <div className="flex items-center gap-2 mb-2">
        <Icon className={`w-4 h-4 ${color}`} />
        <h4 className="text-xs font-medium uppercase tracking-wide text-[var(--text-tertiary)]">
          {title}
        </h4>
      </div>
      <ul className="space-y-1.5">
        {entries.map((entry, i) => (
          <li key={i} className="text-sm flex items-baseline gap-2">
            <span className="text-[var(--text-primary)] flex-1 truncate">
              {entry.title}
            </span>
            <span className="text-xs text-[var(--text-muted)] tabular-nums shrink-0">
              {entry.time}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ActivityLog({ log, compact = false }: ActivityLogProps) {
  const totalItems =
    log.videos.length + log.articles.length + log.papers.length + log.other.length;

  if (totalItems === 0) {
    return (
      <div className="text-[var(--text-tertiary)] text-sm py-4 text-center">
        No activity recorded for this day.
      </div>
    );
  }

  const maxItems = compact ? 3 : undefined;

  return (
    <div>
      <LogSection
        title="Videos"
        icon={VideoIcon}
        color="text-type-youtube"
        entries={maxItems ? log.videos.slice(0, maxItems) : log.videos}
      />
      <LogSection
        title="Articles"
        icon={ArticleIcon}
        color="text-type-article"
        entries={maxItems ? log.articles.slice(0, maxItems) : log.articles}
      />
      <LogSection
        title="Papers"
        icon={PaperIcon}
        color="text-type-paper"
        entries={maxItems ? log.papers.slice(0, maxItems) : log.papers}
      />
      <LogSection
        title="Other"
        icon={OtherIcon}
        color="text-type-other"
        entries={maxItems ? log.other.slice(0, maxItems) : log.other}
      />

      {compact && totalItems > 3 && (
        <p className="text-xs text-[var(--text-muted)] mt-3 pt-3 border-t border-[var(--border-light)]">
          +{totalItems - 3} more items
        </p>
      )}
    </div>
  );
}
