'use client';

import { useState } from 'react';
import { analyzeCredibility, CredibilityResult } from '@/lib/api';

interface CredibilityPanelProps {
  reportId: number;
}

export default function CredibilityPanel({ reportId }: CredibilityPanelProps) {
  const [result, setResult] = useState<CredibilityResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);

  const analyzeSource = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await analyzeCredibility(reportId);
      setResult(data);
      setExpanded(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed');
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 dark:text-green-400';
    if (score >= 60) return 'text-yellow-600 dark:text-yellow-400';
    if (score >= 40) return 'text-orange-600 dark:text-orange-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    if (score >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  };

  if (!result) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Source Credibility
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Analyze the trustworthiness of this content
            </p>
          </div>
          <button
            onClick={analyzeSource}
            disabled={loading}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
                Analyze
              </>
            )}
          </button>
        </div>
        {error && (
          <div className="mt-3 text-sm text-red-600 dark:text-red-400">{error}</div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Header with overall score */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50"
      >
        <div className="flex items-center gap-4">
          <div
            className={`text-3xl font-bold ${getScoreColor(result.overall_score)}`}
          >
            {result.overall_score}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white text-left">
              Credibility Score
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {result.overall_score >= 80
                ? 'Highly credible source'
                : result.overall_score >= 60
                ? 'Generally credible'
                : result.overall_score >= 40
                ? 'Mixed credibility'
                : 'Low credibility'}
            </p>
          </div>
        </div>
        <svg
          className={`w-5 h-5 text-gray-400 transition-transform ${
            expanded ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {expanded && (
        <div className="border-t border-gray-200 dark:border-gray-700 p-4 space-y-4">
          {/* Score breakdown */}
          <div className="grid grid-cols-2 gap-4">
            {result.source_quality && (
              <div>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-gray-600 dark:text-gray-400">Source Quality</span>
                  <span className={getScoreColor(result.source_quality.score)}>
                    {result.source_quality.score}/100
                  </span>
                </div>
                <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${getScoreBg(result.source_quality.score)}`}
                    style={{ width: `${result.source_quality.score}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">{result.source_quality.notes}</p>
              </div>
            )}

            {result.evidence_quality && (
              <div>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-gray-600 dark:text-gray-400">Evidence Quality</span>
                  <span className={getScoreColor(result.evidence_quality.score)}>
                    {result.evidence_quality.score}/100
                  </span>
                </div>
                <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${getScoreBg(result.evidence_quality.score)}`}
                    style={{ width: `${result.evidence_quality.score}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">{result.evidence_quality.notes}</p>
              </div>
            )}

            {result.bias_level && (
              <div>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-gray-600 dark:text-gray-400">Objectivity</span>
                  <span className={getScoreColor(result.bias_level.score)}>
                    {result.bias_level.score}/100
                  </span>
                </div>
                <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${getScoreBg(result.bias_level.score)}`}
                    style={{ width: `${result.bias_level.score}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">{result.bias_level.notes}</p>
              </div>
            )}

            {result.fact_checkability && (
              <div>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-gray-600 dark:text-gray-400">Fact-Checkable</span>
                  <span className={getScoreColor(result.fact_checkability.score)}>
                    {result.fact_checkability.score}/100
                  </span>
                </div>
                <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${getScoreBg(result.fact_checkability.score)}`}
                    style={{ width: `${result.fact_checkability.score}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">{result.fact_checkability.notes}</p>
              </div>
            )}
          </div>

          {/* Red Flags */}
          {result.red_flags.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-red-600 dark:text-red-400 mb-2">
                ⚠️ Red Flags
              </h4>
              <ul className="space-y-1">
                {result.red_flags.map((flag, i) => (
                  <li
                    key={i}
                    className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2"
                  >
                    <span className="text-red-500">•</span>
                    {flag}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Strengths */}
          {result.strengths.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-green-600 dark:text-green-400 mb-2">
                ✓ Strengths
              </h4>
              <ul className="space-y-1">
                {result.strengths.map((strength, i) => (
                  <li
                    key={i}
                    className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2"
                  >
                    <span className="text-green-500">•</span>
                    {strength}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Recommendation */}
          {result.recommendation && (
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                Recommendation
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {result.recommendation}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
