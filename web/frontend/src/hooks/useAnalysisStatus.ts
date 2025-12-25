'use client';

import { useState, useEffect, useCallback } from 'react';
import { fetchJobStatus, type AnalysisJob } from '@/lib/api';

interface UseAnalysisStatusReturn {
  status: 'idle' | 'pending' | 'running' | 'completed' | 'failed';
  progress: string[];
  result: AnalysisJob | null;
  error: string | null;
  startPolling: (jobId: string) => void;
  reset: () => void;
}

/**
 * Hook for tracking analysis job status.
 * Uses polling to check job status.
 */
export function useAnalysisStatus(): UseAnalysisStatusReturn {
  const [status, setStatus] = useState<'idle' | 'pending' | 'running' | 'completed' | 'failed'>('idle');
  const [progress, setProgress] = useState<string[]>([]);
  const [result, setResult] = useState<AnalysisJob | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);

  const startPolling = useCallback((id: string) => {
    setJobId(id);
    setStatus('pending');
    setProgress([]);
    setResult(null);
    setError(null);
  }, []);

  const reset = useCallback(() => {
    setJobId(null);
    setStatus('idle');
    setProgress([]);
    setResult(null);
    setError(null);
  }, []);

  useEffect(() => {
    if (!jobId) return;

    let cancelled = false;
    const pollInterval = 2000; // 2 seconds

    const poll = async () => {
      try {
        const job = await fetchJobStatus(jobId);

        if (cancelled) return;

        setStatus(job.status as typeof status);

        if (job.progress_message) {
          setProgress((prev) => {
            if (prev[prev.length - 1] !== job.progress_message) {
              return [...prev, job.progress_message!];
            }
            return prev;
          });
        }

        if (job.status === 'completed' || job.status === 'failed') {
          setResult(job);
          if (job.status === 'failed' && job.error_message) {
            setError(job.error_message);
          }
          return; // Stop polling
        }

        // Continue polling
        setTimeout(poll, pollInterval);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Unknown error');
          setStatus('failed');
        }
      }
    };

    poll();

    return () => {
      cancelled = true;
    };
  }, [jobId]);

  return { status, progress, result, error, startPolling, reset };
}
