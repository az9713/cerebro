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
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-10">
        <h1 className="font-display text-hero font-bold text-[var(--text-primary)] leading-tight">
          Search Reports
        </h1>
        <p className="mt-2 text-lg text-[var(--text-secondary)]">
          Find insights across all your analyzed content.
        </p>
      </div>

      {/* Search Form */}
      <form onSubmit={handleSearch} className="max-w-2xl mb-10">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search across all reports..."
              className="
                w-full px-4 py-3.5 pl-12
                bg-[var(--bg-card)]
                border border-[var(--border-light)]
                rounded-xl
                text-[var(--text-primary)]
                placeholder:text-[var(--text-muted)]
                focus:outline-none focus:border-[var(--accent-primary)]
                focus:ring-2 focus:ring-[var(--accent-primary)]/10
                transition-all duration-150
              "
            />
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <button
            type="submit"
            disabled={loading || !query.trim()}
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
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>
      </form>

      {/* Results */}
      {searched && (
        <div>
          <p className="text-sm text-[var(--text-tertiary)] mb-6">
            {results.length} result{results.length !== 1 ? 's' : ''} for &quot;{query}&quot;
          </p>

          {results.length === 0 ? (
            <div className="bg-[var(--bg-secondary)] rounded-xl p-12 text-center">
              <svg className="w-16 h-16 mx-auto mb-4 text-[var(--text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <p className="text-[var(--text-secondary)] text-lg">No matching reports found.</p>
              <p className="text-sm text-[var(--text-tertiary)] mt-1">
                Try different keywords or check your spelling.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {results.map((result, i) => (
                <Link
                  key={result.id}
                  href={`/reports/${result.id}`}
                  className={`
                    block bg-[var(--bg-card)] rounded-xl p-5 shadow-card
                    hover:shadow-card-hover
                    transition-all duration-200
                    animate-slide-up stagger-${Math.min(i + 1, 5)}
                  `}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-display font-bold text-lg text-[var(--text-primary)] mb-2">
                        {result.title}
                      </h3>

                      <div
                        className="text-sm text-[var(--text-secondary)] mb-3 line-clamp-2"
                        dangerouslySetInnerHTML={{ __html: result.snippet }}
                      />

                      <div className="flex items-center gap-3 text-xs">
                        <span className={`px-2.5 py-1 rounded-full font-medium ${getTypeColor(result.content_type)}`}>
                          {result.content_type}
                        </span>
                        <span className="text-[var(--text-muted)]">{formatDate(result.created_at)}</span>
                      </div>
                    </div>

                    <svg className="w-5 h-5 text-[var(--text-muted)] shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Empty State - Before Search */}
      {!searched && (
        <div className="bg-[var(--bg-secondary)] rounded-xl p-12 text-center max-w-2xl">
          <svg className="w-16 h-16 mx-auto mb-4 text-[var(--text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 16l2.879-2.879m0 0a3 3 0 104.243-4.242 3 3 0 00-4.243 4.242zM21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-[var(--text-secondary)] text-lg">Search your knowledge base</p>
          <p className="text-sm text-[var(--text-tertiary)] mt-1">
            Enter keywords to find relevant reports and insights.
          </p>
        </div>
      )}
    </div>
  );
}
