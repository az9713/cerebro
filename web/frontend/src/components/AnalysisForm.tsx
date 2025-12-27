'use client';

import { useState, useEffect, useRef } from 'react';
import { submitAnalysis, detectUrlType, fetchModels, ModelInfo, ModelKey } from '@/lib/api';
import { useAnalysisStatus } from '@/hooks/useAnalysisStatus';
import { ProgressIndicator } from './ProgressIndicator';

interface AnalysisFormProps {
  compact?: boolean;
  onComplete?: () => void;
}

// Default models in case API fails
const DEFAULT_MODELS: ModelInfo[] = [
  { key: 'haiku', id: 'claude-3-5-haiku-latest', name: 'Haiku 3.5', description: 'Fast & affordable', input_cost: 0.80, output_cost: 4.00 },
  { key: 'sonnet', id: 'claude-sonnet-4-20250514', name: 'Sonnet 4', description: 'Balanced (recommended)', input_cost: 3.00, output_cost: 15.00 },
  { key: 'opus', id: 'claude-opus-4-20250514', name: 'Opus 4', description: 'Most capable', input_cost: 15.00, output_cost: 75.00 },
];

// URL type indicator component
function UrlTypeIndicator({ type }: { type: 'youtube' | 'article' | 'arxiv' }) {
  const config = {
    youtube: { label: 'YouTube', color: 'bg-type-youtube' },
    article: { label: 'Article', color: 'bg-type-article' },
    arxiv: { label: 'arXiv', color: 'bg-type-paper' },
  };
  const { label, color } = config[type];

  return (
    <span className={`px-2.5 py-1 text-xs font-medium rounded-full text-white ${color}`}>
      {label}
    </span>
  );
}

export function AnalysisForm({ compact = false, onComplete }: AnalysisFormProps) {
  const [input, setInput] = useState('');
  const [selectedModel, setSelectedModel] = useState<ModelKey>('sonnet');
  const [models, setModels] = useState<ModelInfo[]>(DEFAULT_MODELS);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { status, progress, result, error, startSSE, reset } = useAnalysisStatus();

  // Store last submission for retry
  const lastSubmissionRef = useRef<{ url: string; type: 'youtube' | 'article' | 'arxiv'; model: ModelKey } | null>(null);

  // Fetch available models on mount
  useEffect(() => {
    fetchModels()
      .then((data) => {
        setModels(data.models);
        setSelectedModel(data.default as ModelKey);
      })
      .catch(() => {
        // Use defaults on error
      });
  }, []);

  const submitJob = async (url: string, urlType: 'youtube' | 'article' | 'arxiv', model: ModelKey) => {
    setIsSubmitting(true);
    try {
      const response = await submitAnalysis(urlType, url, model);
      lastSubmissionRef.current = { url, type: urlType, model };
      startSSE(response.job_id);
      setInput('');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to submit');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const urlType = detectUrlType(input);
    if (urlType === 'unknown') {
      alert('Please enter a valid YouTube, article, or arXiv URL');
      return;
    }

    await submitJob(input.trim(), urlType, selectedModel);
  };

  const handleRetry = async () => {
    if (!lastSubmissionRef.current) return;

    const { url, type, model } = lastSubmissionRef.current;
    reset();
    await submitJob(url, type, model);
  };

  const handleReset = () => {
    reset();
    lastSubmissionRef.current = null;
    onComplete?.();
  };

  // Get selected model info
  const selectedModelInfo = models.find((m) => m.key === selectedModel);

  // Detect URL type for visual feedback
  const detectedType = input.trim() ? detectUrlType(input) : null;

  // Show progress indicator if job is running
  if (status !== 'idle') {
    return (
      <ProgressIndicator
        status={status}
        progress={progress}
        result={result}
        error={error}
        onReset={handleReset}
        onRetry={handleRetry}
        canRetry={!!lastSubmissionRef.current}
      />
    );
  }

  return (
    <form onSubmit={handleSubmit} className={compact ? '' : 'max-w-2xl'}>
      {/* URL Input */}
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste YouTube, article, or arXiv URL..."
            className="
              w-full px-4 py-3.5
              bg-[var(--bg-card)]
              border border-[var(--border-light)]
              rounded-xl
              text-[var(--text-primary)]
              placeholder:text-[var(--text-muted)]
              focus:outline-none focus:border-[var(--accent-primary)]
              focus:ring-2 focus:ring-[var(--accent-primary)]/10
              transition-all duration-150
              pr-24
            "
            disabled={isSubmitting}
          />
          {detectedType && detectedType !== 'unknown' && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2">
              <UrlTypeIndicator type={detectedType} />
            </span>
          )}
        </div>
        <button
          type="submit"
          disabled={isSubmitting || !input.trim() || detectedType === 'unknown'}
          className="
            px-6 py-3.5
            bg-[var(--accent-primary)] text-white
            rounded-xl font-medium
            hover:bg-[var(--accent-hover)]
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-all duration-150
            active:scale-[0.98]
          "
        >
          {isSubmitting ? 'Submitting...' : 'Analyze'}
        </button>
      </div>

      {/* Invalid URL warning */}
      {input.trim() && detectedType === 'unknown' && (
        <p className="mt-3 text-sm text-amber-600 flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          Please enter a valid YouTube, article, or arXiv URL
        </p>
      )}

      {/* Model Selector */}
      <div className="mt-5 flex flex-wrap items-center gap-4">
        <label className="text-sm font-medium text-[var(--text-secondary)]">
          Model:
        </label>
        <div className="flex gap-2">
          {models.map((model) => (
            <button
              key={model.key}
              type="button"
              onClick={() => setSelectedModel(model.key as ModelKey)}
              className={`
                px-4 py-2 text-sm rounded-lg
                border-2 transition-all duration-150
                ${
                  selectedModel === model.key
                    ? 'bg-[var(--accent-primary)]/10 border-[var(--accent-primary)] text-[var(--accent-primary)] font-medium'
                    : 'bg-[var(--bg-card)] border-[var(--border-light)] text-[var(--text-secondary)] hover:border-[var(--border-medium)]'
                }
              `}
            >
              {model.name}
            </button>
          ))}
        </div>
        {selectedModelInfo && (
          <span className="text-xs text-[var(--text-tertiary)] bg-[var(--bg-secondary)] px-3 py-1.5 rounded-full">
            ${selectedModelInfo.input_cost}/${selectedModelInfo.output_cost} per 1M tokens
          </span>
        )}
      </div>

      {/* Help text */}
      {!compact && (
        <div className="mt-6 p-5 bg-[var(--bg-secondary)] rounded-xl">
          <p className="text-sm text-[var(--text-secondary)]">
            <span className="font-medium text-[var(--text-primary)]">Supported content:</span>{' '}
            YouTube videos, web articles, Substack newsletters, and arXiv papers.
          </p>
          {selectedModelInfo && (
            <p className="text-sm text-[var(--text-tertiary)] mt-2">
              <span className="font-medium">Selected:</span> {selectedModelInfo.name} — {selectedModelInfo.description}
            </p>
          )}
        </div>
      )}
    </form>
  );
}
