'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  getRecommendations,
  getTrendingTopics,
  RecommendedReport,
  TrendingTopic,
  getTypeColor,
} from '@/lib/api';

export default function DiscoverPage() {
  const [recommendations, setRecommendations] = useState<RecommendedReport[]>([]);
  const [trending, setTrending] = useState<TrendingTopic[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string>('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [recsData, trendingData] = await Promise.all([
        getRecommendations(10),
        getTrendingTopics(),
      ]);
      setRecommendations(recsData.recommendations);
      setMessage(recsData.message || '');
      setTrending(trendingData.trending);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 0.8) return 'text-sage-600 dark:text-sage-400';
    if (score >= 0.6) return 'text-amber-600 dark:text-amber-400';
    return 'text-[var(--text-tertiary)]';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-3">
          <svg className="w-6 h-6 text-[var(--accent-primary)] animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span className="text-[var(--text-secondary)]">Loading recommendations...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-10">
        <h1 className="font-display text-hero font-bold text-[var(--text-primary)] leading-tight">
          Discover
        </h1>
        <p className="mt-2 text-lg text-[var(--text-secondary)]">
          Smart recommendations based on your reading patterns.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Main Recommendations */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="font-display text-h2 font-bold text-[var(--text-primary)]">
            Recommended for You
          </h2>

          {message && (
            <div className="bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] p-4 rounded-xl text-sm">
              {message}
            </div>
          )}

          {recommendations.length === 0 ? (
            <div className="bg-[var(--bg-secondary)] rounded-xl p-12 text-center">
              <svg className="w-16 h-16 mx-auto mb-4 text-[var(--text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              <h3 className="font-display font-bold text-lg text-[var(--text-primary)] mb-2">
                No recommendations yet
              </h3>
              <p className="text-[var(--text-secondary)]">
                Start analyzing content to get personalized recommendations.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {recommendations.map((rec, i) => (
                <Link
                  key={rec.id}
                  href={`/reports/${rec.id}`}
                  className={`
                    block bg-[var(--bg-card)] rounded-xl p-5 shadow-card
                    hover:shadow-card-hover transition-all duration-200
                    animate-slide-up stagger-${Math.min(i + 1, 5)}
                  `}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getTypeColor(rec.content_type)}`}>
                          {rec.content_type}
                        </span>
                        <span className={`text-sm font-medium ${getScoreColor(rec.score)}`}>
                          {Math.round(rec.score * 100)}% match
                        </span>
                      </div>
                      <h3 className="font-display font-bold text-lg text-[var(--text-primary)] mb-1">
                        {rec.title}
                      </h3>
                      <p className="text-sm text-[var(--text-secondary)]">
                        {rec.reason}
                      </p>
                    </div>
                    <svg className="w-5 h-5 text-[var(--text-muted)] shrink-0 ml-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Trending Topics */}
          <div>
            <h2 className="font-display text-h3 font-bold text-[var(--text-primary)] mb-4">
              Trending Topics
            </h2>

            {trending.length === 0 ? (
              <div className="bg-[var(--bg-card)] rounded-xl p-5 shadow-card text-center">
                <p className="text-[var(--text-tertiary)] text-sm">No trending topics yet</p>
              </div>
            ) : (
              <div className="bg-[var(--bg-card)] rounded-xl p-5 shadow-card">
                <div className="space-y-3">
                  {trending.map((topic, index) => (
                    <Link
                      key={topic.topic}
                      href={`/search?q=${encodeURIComponent(topic.topic)}`}
                      className="flex items-center justify-between p-2 rounded-lg hover:bg-[var(--bg-secondary)] transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-lg font-bold text-[var(--text-muted)] w-6">
                          {index + 1}
                        </span>
                        <span className="text-[var(--text-primary)] capitalize">
                          {topic.topic}
                        </span>
                      </div>
                      <span className="text-sm text-[var(--text-tertiary)]">
                        {topic.count} {topic.count === 1 ? 'mention' : 'mentions'}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Reading Insights */}
          <div className="bg-gradient-to-br from-[var(--accent-primary)] to-amber-600 rounded-xl p-6 text-white">
            <h3 className="font-display font-bold mb-4">Reading Insights</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="opacity-80">Total Topics</span>
                <span className="font-medium">{trending.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="opacity-80">Recommendations</span>
                <span className="font-medium">{recommendations.length}</span>
              </div>
            </div>
          </div>

          {/* Tips Card */}
          <div className="bg-[var(--bg-secondary)] rounded-xl p-5">
            <h3 className="font-display font-bold text-[var(--text-primary)] mb-3">
              Tips for Better Recommendations
            </h3>
            <ul className="space-y-2 text-sm text-[var(--text-secondary)]">
              <li className="flex items-start gap-2">
                <span className="text-[var(--accent-primary)]">•</span>
                Analyze diverse content types
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[var(--accent-primary)]">•</span>
                Review content regularly
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[var(--accent-primary)]">•</span>
                Use tags to organize reports
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[var(--accent-primary)]">•</span>
                Set learning goals
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
