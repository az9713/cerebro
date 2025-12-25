'use client';

import Link from 'next/link';
import { type AnalysisJob } from '@/lib/api';

interface ProgressIndicatorProps {
  status: 'idle' | 'pending' | 'running' | 'completed' | 'failed';
  progress: string[];
  result: AnalysisJob | null;
  error: string | null;
  onReset: () => void;
}

export function ProgressIndicator({
  status,
  progress,
  result,
  error,
  onReset,
}: ProgressIndicatorProps) {
  const getStatusColor = () => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 border-yellow-300';
      case 'running':
        return 'bg-blue-100 border-blue-300';
      case 'completed':
        return 'bg-green-100 border-green-300';
      case 'failed':
        return 'bg-red-100 border-red-300';
      default:
        return 'bg-slate-100 border-slate-300';
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

  return (
    <div className={`p-4 rounded-lg border ${getStatusColor()}`}>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xl">{getStatusIcon()}</span>
        <span className="font-medium capitalize">{status}</span>
      </div>

      {/* Progress messages */}
      {progress.length > 0 && (
        <div className="mb-3 max-h-40 overflow-y-auto">
          <div className="text-sm text-slate-600 space-y-1">
            {progress.slice(-5).map((msg, i) => (
              <p key={i} className="truncate">
                {msg}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="mb-3 p-2 bg-red-50 rounded text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Completed - show link to report */}
      {status === 'completed' && result?.result_filepath && (
        <div className="mb-3">
          <p className="text-sm text-green-700">
            Report saved! Check your reports list.
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        {(status === 'completed' || status === 'failed') && (
          <button
            onClick={onReset}
            className="px-4 py-2 bg-slate-200 text-slate-700 rounded hover:bg-slate-300 transition-colors"
          >
            Analyze Another
          </button>
        )}

        {status === 'completed' && (
          <Link
            href="/reports"
            className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 transition-colors"
          >
            View Reports
          </Link>
        )}
      </div>
    </div>
  );
}
