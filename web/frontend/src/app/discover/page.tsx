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
    if (score >= 0.8) return 'text-green-600 dark:text-green-400';
    if (score >= 0.6) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-gray-600 dark:text-gray-400';
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Discover
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Smart recommendations based on your reading patterns
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Recommendations */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Recommended for You
          </h2>

          {message && (
            <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 p-4 rounded-lg">
              {message}
            </div>
          )}

          {recommendations.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="text-5xl mb-4">🔮</div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                No recommendations yet
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Start analyzing content to get personalized recommendations
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {recommendations.map((rec) => (
                <Link
                  key={rec.id}
                  href={`/reports/${rec.id}`}
                  className="block bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:border-blue-500 dark:hover:border-blue-400 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span
                          className={`px-2 py-0.5 rounded text-xs font-medium ${getTypeColor(
                            rec.content_type
                          )}`}
                        >
                          {rec.content_type}
                        </span>
                        <span
                          className={`text-sm font-medium ${getScoreColor(rec.score)}`}
                        >
                          {Math.round(rec.score * 100)}% match
                        </span>
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
                        {rec.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {rec.reason}
                      </p>
                    </div>
                    <svg
                      className="w-5 h-5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar: Trending Topics */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Trending Topics
          </h2>

          {trending.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 text-center">
              <p className="text-gray-600 dark:text-gray-400">
                No trending topics yet
              </p>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <div className="space-y-3">
                {trending.map((topic, index) => (
                  <Link
                    key={topic.topic}
                    href={`/search?q=${encodeURIComponent(topic.topic)}`}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-bold text-gray-400 w-6">
                        {index + 1}
                      </span>
                      <span className="text-gray-900 dark:text-white capitalize">
                        {topic.topic}
                      </span>
                    </div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {topic.count} {topic.count === 1 ? 'mention' : 'mentions'}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Quick Stats */}
          <div className="bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg p-6 text-white">
            <h3 className="font-semibold mb-4">Reading Insights</h3>
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
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
              💡 Tips for Better Recommendations
            </h3>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li>• Analyze diverse content types</li>
              <li>• Review content regularly</li>
              <li>• Use tags to organize reports</li>
              <li>• Set learning goals</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
