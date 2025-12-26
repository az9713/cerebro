'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchJobStatus, type AnalysisJob } from '@/lib/api';

interface UseAnalysisStatusReturn {
  status: 'idle' | 'pending' | 'running' | 'completed' | 'failed';
  progress: string[];
  result: AnalysisJob | null;
  error: string | null;
  jobId: string | null;
  startPolling: (jobId: string) => void;
  startSSE: (jobId: string) => void;
  reset: () => void;
}

/**
 * Hook for tracking analysis job status.
 * Supports both polling and SSE (Server-Sent Events) for real-time updates.
 */
export function useAnalysisStatus(): UseAnalysisStatusReturn {
  const [status, setStatus] = useState<'idle' | 'pending' | 'running' | 'completed' | 'failed'>('idle');
  const [progress, setProgress] = useState<string[]>([]);
  const [result, setResult] = useState<AnalysisJob | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);
  const [useSSE, setUseSSE] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);

  const reset = useCallback(() => {
    // Close any existing SSE connection
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    setJobId(null);
    setStatus('idle');
    setProgress([]);
    setResult(null);
    setError(null);
    setUseSSE(false);
  }, []);

  const startPolling = useCallback((id: string) => {
    reset();
    setJobId(id);
    setStatus('pending');
    setUseSSE(false);
  }, [reset]);

  const startSSE = useCallback((id: string) => {
    reset();
    setJobId(id);
    setStatus('pending');
    setUseSSE(true);
  }, [reset]);

  // SSE-based progress tracking
  useEffect(() => {
    if (!jobId || !useSSE) return;

    const eventSource = new EventSource(`/api/analysis/jobs/${jobId}/stream`);
    eventSourceRef.current = eventSource;

    eventSource.addEventListener('progress', (event) => {
      const message = event.data;
      if (message && message !== 'Processing...') {
        setProgress((prev) => {
          if (prev[prev.length - 1] !== message) {
            return [...prev, message];
          }
          return prev;
        });
      }
      setStatus('running');
    });

    eventSource.addEventListener('complete', (event) => {
      try {
        const job = JSON.parse(event.data);
        setResult(job);
        setStatus(job.status as 'completed' | 'failed');
        if (job.status === 'failed' && job.error_message) {
          setError(job.error_message);
        }
      } catch (e) {
        console.error('Failed to parse SSE complete event:', e);
      }
      eventSource.close();
    });

    eventSource.onerror = (e) => {
      console.error('SSE error:', e);
      // Fall back to polling on SSE error
      eventSource.close();
      setUseSSE(false);
    };

    return () => {
      eventSource.close();
      eventSourceRef.current = null;
    };
  }, [jobId, useSSE]);

  // Polling-based progress tracking (fallback)
  useEffect(() => {
    if (!jobId || useSSE) return;

    let cancelled = false;
    const pollInterval = 2000;

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
          return;
        }

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
  }, [jobId, useSSE]);

  return { status, progress, result, error, jobId, startPolling, startSSE, reset };
}
