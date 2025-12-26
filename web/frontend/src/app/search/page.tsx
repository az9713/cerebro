'use client';

import { useState } from 'react';
import Link from 'next/link';
import { searchReports, type SearchResult, formatDate, getTypeColor } from '@/lib/api';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setSearched(true);

    try {
      const data = await searchReports(query);
      setResults(data);
    } catch (err) {
      console.error('Search failed:', err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-8">Search Reports</h1>

      <form onSubmit={handleSearch} className="max-w-2xl mb-8">
        <div className="flex gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search across all reports..."
            className="flex-1 px-4 py-3 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent placeholder:text-slate-400 dark:placeholder:text-slate-500"
          />
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>
      </form>

      {searched && (
        <div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
            {results.length} result{results.length !== 1 ? 's' : ''} for &quot;{query}&quot;
          </p>

          {results.length === 0 ? (
            <div className="text-center py-12 text-slate-500 dark:text-slate-400">
              No matching reports found.
            </div>
          ) : (
            <div className="space-y-4">
              {results.map((result) => (
                <Link
                  key={result.id}
                  href={`/reports/${result.id}`}
                  className="block bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4 hover:border-primary-300 dark:hover:border-primary-600 hover:shadow-md transition-all"
                >
                  <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-1">
                    {result.title}
                  </h3>

                  <div
                    className="text-sm text-slate-600 dark:text-slate-400 mb-2"
                    dangerouslySetInnerHTML={{ __html: result.snippet }}
                  />

                  <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                    <span className={`px-2 py-0.5 rounded-full ${getTypeColor(result.content_type)}`}>
                      {result.content_type}
                    </span>
                    <span>{formatDate(result.created_at)}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
