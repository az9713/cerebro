import { type ActivityLog as ActivityLogType, type ActivityLogEntry } from '@/lib/api';

interface ActivityLogProps {
  log: ActivityLogType;
  compact?: boolean;
}

function LogSection({
  title,
  icon,
  entries,
}: {
  title: string;
  icon: string;
  entries: ActivityLogEntry[];
}) {
  if (entries.length === 0) return null;

  return (
    <div className="mb-4">
      <h4 className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
        {icon} {title}
      </h4>
      <ul className="space-y-1">
        {entries.map((entry, i) => (
          <li key={i} className="text-sm">
            <span className="text-slate-900 dark:text-slate-100">{entry.title}</span>
            <span className="text-slate-400 dark:text-slate-500 ml-2">{entry.time}</span>
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
      <div className="text-slate-500 dark:text-slate-400 text-sm py-4">
        No activity recorded for this day.
      </div>
    );
  }

  const maxItems = compact ? 3 : undefined;

  return (
    <div>
      <LogSection
        title="Videos"
        icon="🎬"
        entries={maxItems ? log.videos.slice(0, maxItems) : log.videos}
      />
      <LogSection
        title="Articles"
        icon="📰"
        entries={maxItems ? log.articles.slice(0, maxItems) : log.articles}
      />
      <LogSection
        title="Papers"
        icon="📚"
        entries={maxItems ? log.papers.slice(0, maxItems) : log.papers}
      />
      <LogSection
        title="Other"
        icon="📝"
        entries={maxItems ? log.other.slice(0, maxItems) : log.other}
      />

      {compact && totalItems > 3 && (
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">
          +{totalItems - 3} more items
        </p>
      )}
    </div>
  );
}
