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
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste YouTube, article, or arXiv URL..."
            className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent pr-24 placeholder:text-slate-400 dark:placeholder:text-slate-500"
            disabled={isSubmitting}
          />
          {detectedType && detectedType !== 'unknown' && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 px-2 py-1 text-xs rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
              {detectedType === 'youtube' && '🎬 YouTube'}
              {detectedType === 'article' && '📰 Article'}
              {detectedType === 'arxiv' && '📚 arXiv'}
            </span>
          )}
        </div>
        <button
          type="submit"
          disabled={isSubmitting || !input.trim() || detectedType === 'unknown'}
          className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
        >
          {isSubmitting ? 'Submitting...' : 'Analyze'}
        </button>
      </div>

      {/* Invalid URL warning */}
      {input.trim() && detectedType === 'unknown' && (
        <p className="mt-2 text-sm text-amber-600 dark:text-amber-400 flex items-center gap-1">
          <span>⚠️</span>
          Please enter a valid YouTube, article, or arXiv URL
        </p>
      )}

      {/* Model Selector */}
      <div className="mt-4 flex flex-wrap items-center gap-4">
        <label className="text-sm font-medium text-slate-600 dark:text-slate-300">Model:</label>
        <div className="flex gap-2">
          {models.map((model) => (
            <button
              key={model.key}
              type="button"
              onClick={() => setSelectedModel(model.key as ModelKey)}
              className={`px-3 py-1.5 text-sm rounded-lg border-2 transition-all ${
                selectedModel === model.key
                  ? 'bg-primary-50 dark:bg-primary-900/30 border-primary-500 text-primary-700 dark:text-primary-300 font-medium'
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-500'
              }`}
            >
              {model.name}
            </button>
          ))}
        </div>
        {selectedModelInfo && (
          <span className="text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded">
            ${selectedModelInfo.input_cost}/${selectedModelInfo.output_cost} per 1M tokens
          </span>
        )}
      </div>

      {!compact && (
        <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
          <p className="text-sm text-slate-600 dark:text-slate-300">
            <span className="font-medium">Supported content:</span> YouTube videos, web articles, Substack newsletters, and arXiv papers.
          </p>
          {selectedModelInfo && (
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
              <span className="font-medium">Selected model:</span> {selectedModelInfo.name} — {selectedModelInfo.description}
            </p>
          )}
        </div>
      )}
    </form>
  );
}
