'use client';

import { useState, useEffect } from 'react';
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
  const { status, progress, result, error, startPolling, reset } = useAnalysisStatus();

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const urlType = detectUrlType(input);
    if (urlType === 'unknown') {
      alert('Please enter a valid YouTube, article, or arXiv URL');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await submitAnalysis(urlType, input.trim(), selectedModel);
      startPolling(response.job_id);
      setInput('');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to submit');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    reset();
    onComplete?.();
  };

  // Get selected model info
  const selectedModelInfo = models.find((m) => m.key === selectedModel);

  // Show progress indicator if job is running
  if (status !== 'idle') {
    return (
      <ProgressIndicator
        status={status}
        progress={progress}
        result={result}
        error={error}
        onReset={handleReset}
      />
    );
  }

  return (
    <form onSubmit={handleSubmit} className={compact ? '' : 'max-w-2xl'}>
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Paste YouTube, article, or arXiv URL..."
          className="flex-1 px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          disabled={isSubmitting}
        />
        <button
          type="submit"
          disabled={isSubmitting || !input.trim()}
          className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting ? 'Submitting...' : 'Analyze'}
        </button>
      </div>

      {/* Model Selector */}
      <div className="mt-3 flex items-center gap-4">
        <label className="text-sm font-medium text-slate-600">Model:</label>
        <div className="flex gap-2">
          {models.map((model) => (
            <button
              key={model.key}
              type="button"
              onClick={() => setSelectedModel(model.key as ModelKey)}
              className={`px-3 py-1.5 text-sm rounded-md border transition-colors ${
                selectedModel === model.key
                  ? 'bg-primary-100 border-primary-500 text-primary-700'
                  : 'bg-white border-slate-300 text-slate-600 hover:border-slate-400'
              }`}
            >
              {model.name}
            </button>
          ))}
        </div>
        {selectedModelInfo && (
          <span className="text-xs text-slate-500">
            ${selectedModelInfo.input_cost}/${selectedModelInfo.output_cost} per 1M tokens
          </span>
        )}
      </div>

      {!compact && (
        <p className="mt-3 text-sm text-slate-500">
          Supports YouTube videos, web articles, Substack newsletters, and arXiv papers.
          {selectedModelInfo && (
            <span className="block mt-1 text-slate-400">
              {selectedModelInfo.description}
            </span>
          )}
        </p>
      )}
    </form>
  );
}
