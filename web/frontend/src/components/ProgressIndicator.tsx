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

export function ProgressIndicator({
  status,
  progress,
  result,
  error,
  onReset,
  onRetry,
  canRetry = false,
}: ProgressIndicatorProps) {
  const getStatusColor = () => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-300 dark:border-yellow-700';
      case 'running':
        return 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700';
      case 'completed':
        return 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700';
      case 'failed':
        return 'bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-700';
      default:
        return 'bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-600';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'pending':
        return '⏳';
      case 'running':
        return '🔄';
      case 'completed':
        return '✅';
      case 'failed':
        return '❌';
      default:
        return '•';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'pending':
        return 'Preparing analysis...';
      case 'running':
        return 'Analyzing content...';
      case 'completed':
        return 'Analysis complete!';
      case 'failed':
        return 'Analysis failed';
      default:
        return status;
    }
  };

  return (
    <div className={`p-6 rounded-lg border-2 ${getStatusColor()}`}>
      {/* Status header */}
      <div className="flex items-center gap-3 mb-4">
        <span className="text-2xl animate-pulse">{getStatusIcon()}</span>
        <div>
          <span className="font-semibold text-lg capitalize">{getStatusText()}</span>
          {(status === 'pending' || status === 'running') && (
            <p className="text-sm text-slate-500 dark:text-slate-400">This may take a minute...</p>
          )}
        </div>
      </div>

      {/* Progress messages */}
      {progress.length > 0 && (
        <div className="mb-4 p-3 bg-white/50 dark:bg-slate-800/50 rounded-lg max-h-48 overflow-y-auto">
          <div className="text-sm text-slate-600 dark:text-slate-300 space-y-2">
            {progress.slice(-5).map((msg, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="text-primary-500">→</span>
                <p className="flex-1">{msg}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Loading animation for pending/running */}
      {(status === 'pending' || status === 'running') && (
        <div className="mb-4">
          <div className="h-2 bg-white/50 dark:bg-slate-700 rounded-full overflow-hidden">
            <div className="h-full bg-primary-500 rounded-full animate-pulse" style={{ width: '60%' }} />
          </div>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="mb-4 p-4 bg-red-100 dark:bg-red-900/30 rounded-lg border border-red-200 dark:border-red-800">
          <div className="flex items-start gap-2">
            <span className="text-red-500">⚠️</span>
            <div>
              <p className="font-medium text-red-800 dark:text-red-300">Error occurred</p>
              <p className="text-sm text-red-700 dark:text-red-400 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Success message */}
      {status === 'completed' && result?.result_filepath && (
        <div className="mb-4 p-4 bg-green-100 dark:bg-green-900/30 rounded-lg border border-green-200 dark:border-green-800">
          <div className="flex items-start gap-2">
            <span className="text-green-500">🎉</span>
            <div>
              <p className="font-medium text-green-800 dark:text-green-300">Report saved successfully!</p>
              <p className="text-sm text-green-700 dark:text-green-400 mt-1">
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
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2"
          >
            <span>🔄</span>
            Retry Analysis
          </button>
        )}

        {(status === 'completed' || status === 'failed') && (
          <button
            onClick={onReset}
            className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
          >
            Analyze Another
          </button>
        )}

        {status === 'completed' && (
          <Link
            href="/reports"
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
          >
            <span>📄</span>
            View Reports
          </Link>
        )}
      </div>
    </div>
  );
}
