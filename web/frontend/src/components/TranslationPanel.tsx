'use client';

import { useState, useEffect } from 'react';
import {
  getSupportedLanguages,
  translateReport,
  Language,
  TranslationResult,
} from '@/lib/api';

interface TranslationPanelProps {
  reportId: number;
}

export default function TranslationPanel({ reportId }: TranslationPanelProps) {
  const [languages, setLanguages] = useState<Language[]>([]);
  const [selectedLang, setSelectedLang] = useState<string>('');
  const [translation, setTranslation] = useState<TranslationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingLanguages, setLoadingLanguages] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    loadLanguages();
  }, []);

  const loadLanguages = async () => {
    try {
      const data = await getSupportedLanguages();
      setLanguages(data.languages);
      if (data.languages.length > 0) {
        setSelectedLang(data.languages[0].code);
      }
    } catch (err) {
      console.error('Failed to load languages:', err);
    } finally {
      setLoadingLanguages(false);
    }
  };

  const handleTranslate = async () => {
    if (!selectedLang) return;

    setLoading(true);
    setError(null);
    try {
      const result = await translateReport(reportId, selectedLang);
      setTranslation(result);
      setExpanded(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Translation failed');
    } finally {
      setLoading(false);
    }
  };

  if (loadingLanguages) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          Loading languages...
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Translate Report
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Read this report in another language
            </p>
          </div>
          <span className="text-2xl">🌐</span>
        </div>

        <div className="flex gap-2">
          <select
            value={selectedLang}
            onChange={(e) => setSelectedLang(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            {languages.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.name}
              </option>
            ))}
          </select>
          <button
            onClick={handleTranslate}
            disabled={loading || !selectedLang}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Translating...
              </>
            ) : (
              'Translate'
            )}
          </button>
        </div>

        {error && (
          <div className="mt-3 text-sm text-red-600 dark:text-red-400">{error}</div>
        )}
      </div>

      {/* Translation Result */}
      {translation && (
        <>
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-900 dark:text-white">
                {translation.language_name} Translation
              </span>
              <span className="text-sm text-gray-500">
                ({translation.translated_title.slice(0, 50)}...)
              </span>
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
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <div className="mb-4">
                <h4 className="text-xs uppercase tracking-wide text-gray-500 mb-1">
                  Translated Title
                </h4>
                <p className="text-lg font-medium text-gray-900 dark:text-white">
                  {translation.translated_title}
                </p>
              </div>

              <div>
                <h4 className="text-xs uppercase tracking-wide text-gray-500 mb-2">
                  Translated Content
                </h4>
                <div className="max-h-96 overflow-y-auto bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
                  <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap">
                    {translation.translated_content}
                  </div>
                </div>
              </div>

              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(translation.translated_content);
                  }}
                  className="px-3 py-1 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                >
                  Copy to Clipboard
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
