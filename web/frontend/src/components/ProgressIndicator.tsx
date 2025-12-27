'use client';

import Link from 'next/link';
import { type AnalysisJob } from '@/lib/api';

interface ProgressIndicatorProps {
  status: 'idle' | 'pending' | 'running' | 'completed' | 'failed';
  progress: string[];
  result: AnalysisJob | null;
  error: string | null;
  onReset: () => void;
  onRetry?: () => void;
  canRetry?: boolean;
}

// Status icons as SVG components
function PendingIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function RunningIcon({ className }: { className?: string }) {
  return (
    <svg className={`${className} animate-spin`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
  );
}

function SuccessIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function ErrorIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

export function ProgressIndicator({
  status,
  progress,
  result,
  error,
  onReset,
  onRetry,
  canRetry = false,
}: ProgressIndicatorProps) {
  const getStatusConfig = () => {
    switch (status) {
      case 'pending':
        return {
          bg: 'bg-amber-50 dark:bg-amber-900/10',
          border: 'border-amber-200 dark:border-amber-800/50',
          iconColor: 'text-amber-500',
          icon: <PendingIcon className="w-6 h-6" />,
          text: 'Preparing analysis...',
          subtext: 'This may take a minute...',
        };
      case 'running':
        return {
          bg: 'bg-[var(--accent-primary)]/5',
          border: 'border-[var(--accent-primary)]/20',
          iconColor: 'text-[var(--accent-primary)]',
          icon: <RunningIcon className="w-6 h-6" />,
          text: 'Analyzing content...',
          subtext: 'Processing your content...',
        };
      case 'completed':
        return {
          bg: 'bg-sage-50 dark:bg-sage-900/10',
          border: 'border-sage-200 dark:border-sage-800/50',
          iconColor: 'text-sage-500',
          icon: <SuccessIcon className="w-6 h-6" />,
          text: 'Analysis complete!',
          subtext: null,
        };
      case 'failed':
        return {
          bg: 'bg-red-50 dark:bg-red-900/10',
          border: 'border-red-200 dark:border-red-800/50',
          iconColor: 'text-red-500',
          icon: <ErrorIcon className="w-6 h-6" />,
          text: 'Analysis failed',
          subtext: null,
        };
      default:
        return {
          bg: 'bg-[var(--bg-secondary)]',
          border: 'border-[var(--border-light)]',
          iconColor: 'text-[var(--text-tertiary)]',
          icon: null,
          text: '',
          subtext: null,
        };
    }
  };

  const config = getStatusConfig();

  return (
    <div className={`p-6 rounded-xl border ${config.bg} ${config.border}`}>
      {/* Status header */}
      <div className="flex items-center gap-4 mb-5">
        <span className={config.iconColor}>{config.icon}</span>
        <div>
          <span className="font-display font-bold text-lg text-[var(--text-primary)]">
            {config.text}
          </span>
          {config.subtext && (
            <p className="text-sm text-[var(--text-tertiary)]">{config.subtext}</p>
          )}
        </div>
      </div>

      {/* Progress messages */}
      {progress.length > 0 && (
        <div className="mb-5 p-4 bg-[var(--bg-card)] rounded-lg max-h-48 overflow-y-auto">
          <div className="text-sm text-[var(--text-secondary)] space-y-2">
            {progress.slice(-5).map((msg, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="text-[var(--accent-primary)] mt-0.5">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </span>
                <p className="flex-1">{msg}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Loading animation for pending/running */}
      {(status === 'pending' || status === 'running') && (
        <div className="mb-5">
          <div className="h-1.5 bg-[var(--bg-secondary)] rounded-full overflow-hidden relative">
            <div
              className="h-full bg-[var(--accent-primary)] rounded-full transition-all duration-500 ease-out progress-animate"
              style={{
                width: status === 'pending' ? '30%' : '70%',
              }}
            />
            {/* Animated shimmer overlay */}
            <div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
              style={{
                animation: 'shimmer 1.5s ease-in-out infinite',
                backgroundSize: '200% 100%',
              }}
            />
          </div>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="mb-5 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800/50">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-red-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <p className="font-medium text-red-800 dark:text-red-300">Error occurred</p>
              <p className="text-sm text-red-700 dark:text-red-400 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Success message */}
      {status === 'completed' && result?.result_filepath && (
        <div className="mb-5 p-4 bg-sage-50 dark:bg-sage-900/20 rounded-lg border border-sage-200 dark:border-sage-800/50">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-sage-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
            </svg>
            <div>
              <p className="font-medium text-sage-800 dark:text-sage-300">Report saved successfully!</p>
              <p className="text-sm text-sage-700 dark:text-sage-400 mt-1">
                Your analysis is ready to view in the reports list.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex flex-wrap gap-3">
        {status === 'failed' && canRetry && onRetry && (
          <button
            onClick={onRetry}
            className="
              px-5 py-2.5 rounded-lg font-medium
              bg-[var(--accent-primary)] text-white
              hover:bg-[var(--accent-hover)]
              transition-all duration-150
              active:scale-[0.98]
              flex items-center gap-2
            "
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Retry Analysis
          </button>
        )}

        {(status === 'completed' || status === 'failed') && (
          <button
            onClick={onReset}
            className="
              px-5 py-2.5 rounded-lg font-medium
              bg-[var(--bg-secondary)] text-[var(--text-secondary)]
              border border-[var(--border-light)]
              hover:bg-[var(--bg-card)] hover:text-[var(--text-primary)]
              transition-all duration-150
              active:scale-[0.98]
            "
          >
            Analyze Another
          </button>
        )}

        {status === 'completed' && (
          <Link
            href="/reports"
            className="
              px-5 py-2.5 rounded-lg font-medium
              bg-sage-500 text-white
              hover:bg-sage-600
              transition-all duration-150
              active:scale-[0.98]
              flex items-center gap-2
            "
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            View Reports
          </Link>
        )}
      </div>
    </div>
  );
}
