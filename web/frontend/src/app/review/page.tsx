'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  getDueReviews,
  submitReview,
  getReviewStats,
  type ReviewItem,
  type ReviewStats,
} from '@/lib/api';

// Quality rating descriptions
const QUALITY_RATINGS = [
  { value: 0, label: 'Blackout', description: "Didn't remember at all", color: 'bg-red-600' },
  { value: 1, label: 'Wrong', description: 'Wrong but recognized answer', color: 'bg-red-500' },
  { value: 2, label: 'Hard', description: 'Wrong but seemed easy', color: 'bg-orange-500' },
  { value: 3, label: 'Difficult', description: 'Correct with difficulty', color: 'bg-yellow-500' },
  { value: 4, label: 'Good', description: 'Correct with hesitation', color: 'bg-green-500' },
  { value: 5, label: 'Perfect', description: 'Instant recall', color: 'bg-green-600' },
];

export default function ReviewPage() {
  const [dueItems, setDueItems] = useState<ReviewItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [sessionReviewed, setSessionReviewed] = useState(0);

  // Load due reviews and stats
  useEffect(() => {
    const loadData = async () => {
      try {
        const [dueData, statsData] = await Promise.all([
          getDueReviews(20),
          getReviewStats(),
        ]);
        setDueItems(dueData.items);
        setStats(statsData);

        if (dueData.items.length === 0) {
          setSessionComplete(true);
        }
      } catch (err) {
        console.error('Failed to load review data:', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const currentItem = dueItems[currentIndex];

  const handleRating = async (quality: number) => {
    if (!currentItem) return;

    try {
      await submitReview(currentItem.report_id, quality);
      setSessionReviewed((prev) => prev + 1);

      // Move to next item
      if (currentIndex < dueItems.length - 1) {
        setCurrentIndex((prev) => prev + 1);
        setShowAnswer(false);
      } else {
        setSessionComplete(true);
      }
    } catch (err) {
      console.error('Failed to submit review:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-500 dark:text-slate-400">Loading reviews...</div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
            Review Session
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Strengthen your knowledge with spaced repetition
          </p>
        </div>

        {/* Stats Summary */}
        {stats && (
          <div className="flex items-center gap-6 text-sm">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary-600">{stats.streak}</div>
              <div className="text-slate-500 dark:text-slate-400">Day Streak</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {stats.reviewed_today}
              </div>
              <div className="text-slate-500 dark:text-slate-400">Reviewed Today</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {stats.due_today}
              </div>
              <div className="text-slate-500 dark:text-slate-400">Due Today</div>
            </div>
          </div>
        )}
      </div>

      {/* Session Complete */}
      {sessionComplete && (
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-8 text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
            Review Complete!
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            {sessionReviewed > 0
              ? `You reviewed ${sessionReviewed} item${sessionReviewed !== 1 ? 's' : ''} this session.`
              : 'No reviews were due. Check back later!'}
          </p>
          <div className="flex justify-center gap-4">
            <Link
              href="/reports"
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              Browse Reports
            </Link>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
            >
              Check for More
            </button>
          </div>
        </div>
      )}

      {/* Review Card */}
      {!sessionComplete && currentItem && (
        <div className="space-y-6">
          {/* Progress Bar */}
          <div className="flex items-center gap-4">
            <div className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary-600 transition-all duration-300"
                style={{ width: `${((currentIndex + 1) / dueItems.length) * 100}%` }}
              />
            </div>
            <span className="text-sm text-slate-500 dark:text-slate-400">
              {currentIndex + 1} / {dueItems.length}
            </span>
          </div>

          {/* Card */}
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
            {/* Question Side */}
            <div className="p-8">
              <div className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">
                {currentItem.content_type}
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">
                {currentItem.title}
              </h2>

              <p className="text-slate-600 dark:text-slate-400 mb-6">
                What do you remember about this content?
              </p>

              {!showAnswer && (
                <button
                  onClick={() => setShowAnswer(true)}
                  className="w-full py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Show Summary
                </button>
              )}
            </div>

            {/* Answer Side */}
            {showAnswer && (
              <div className="border-t border-slate-200 dark:border-slate-700 p-8 bg-slate-50 dark:bg-slate-800/50">
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                  Summary
                </h3>
                <p className="text-slate-600 dark:text-slate-400 mb-6">
                  {currentItem.summary || 'No summary available. View the full report for details.'}
                </p>

                <Link
                  href={`/reports/${currentItem.report_id}`}
                  className="text-primary-600 dark:text-primary-400 hover:underline text-sm"
                  target="_blank"
                >
                  View Full Report →
                </Link>
              </div>
            )}

            {/* Rating Buttons */}
            {showAnswer && (
              <div className="border-t border-slate-200 dark:border-slate-700 p-6">
                <p className="text-center text-sm text-slate-600 dark:text-slate-400 mb-4">
                  How well did you remember?
                </p>
                <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                  {QUALITY_RATINGS.map((rating) => (
                    <button
                      key={rating.value}
                      onClick={() => handleRating(rating.value)}
                      className={`${rating.color} text-white py-3 px-2 rounded-lg hover:opacity-90 transition-opacity`}
                    >
                      <div className="font-semibold">{rating.label}</div>
                      <div className="text-xs opacity-80">{rating.value}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Item Info */}
          <div className="flex justify-between text-sm text-slate-500 dark:text-slate-400">
            <span>Repetitions: {currentItem.repetitions}</span>
            <span>Interval: {currentItem.interval} days</span>
            <span>Ease: {currentItem.ease_factor.toFixed(2)}</span>
          </div>
        </div>
      )}
    </div>
  );
}
