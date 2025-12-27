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

// Quality rating descriptions with warm colors
const QUALITY_RATINGS = [
  { value: 0, label: 'Blackout', description: "Didn't remember at all", color: 'bg-red-500 hover:bg-red-600' },
  { value: 1, label: 'Wrong', description: 'Wrong but recognized answer', color: 'bg-red-400 hover:bg-red-500' },
  { value: 2, label: 'Hard', description: 'Wrong but seemed easy', color: 'bg-amber-500 hover:bg-amber-600' },
  { value: 3, label: 'Difficult', description: 'Correct with difficulty', color: 'bg-amber-400 hover:bg-amber-500' },
  { value: 4, label: 'Good', description: 'Correct with hesitation', color: 'bg-sage-500 hover:bg-sage-600' },
  { value: 5, label: 'Perfect', description: 'Instant recall', color: 'bg-sage-600 hover:bg-sage-700' },
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
        <div className="flex items-center gap-3">
          <svg className="w-6 h-6 text-[var(--accent-primary)] animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span className="text-[var(--text-secondary)]">Loading reviews...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="font-display text-hero font-bold text-[var(--text-primary)] leading-tight">
            Review Session
          </h1>
          <p className="mt-2 text-lg text-[var(--text-secondary)]">
            Strengthen your knowledge with spaced repetition.
          </p>
        </div>

        {/* Stats Summary */}
        {stats && (
          <div className="flex items-center gap-6 text-sm">
            <div className="text-center">
              <div className="text-2xl font-bold text-[var(--accent-primary)]">{stats.streak}</div>
              <div className="text-[var(--text-tertiary)]">Day Streak</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-[var(--text-primary)]">{stats.reviewed_today}</div>
              <div className="text-[var(--text-tertiary)]">Reviewed Today</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-[var(--text-primary)]">{stats.due_today}</div>
              <div className="text-[var(--text-tertiary)]">Due Today</div>
            </div>
          </div>
        )}
      </div>

      {/* Session Complete */}
      {sessionComplete && (
        <div className="bg-[var(--bg-card)] rounded-xl p-8 shadow-card text-center">
          <svg className="w-20 h-20 mx-auto mb-4 text-sage-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 className="font-display text-h1 font-bold text-[var(--text-primary)] mb-2">
            Review Complete!
          </h2>
          <p className="text-[var(--text-secondary)] mb-6">
            {sessionReviewed > 0
              ? `You reviewed ${sessionReviewed} item${sessionReviewed !== 1 ? 's' : ''} this session.`
              : 'No reviews were due. Check back later!'}
          </p>
          <div className="flex justify-center gap-4">
            <Link
              href="/reports"
              className="
                px-6 py-2.5
                bg-[var(--accent-primary)] text-white
                rounded-xl font-medium
                hover:bg-[var(--accent-hover)]
                transition-colors
              "
            >
              Browse Reports
            </Link>
            <button
              onClick={() => window.location.reload()}
              className="
                px-6 py-2.5
                bg-[var(--bg-secondary)] text-[var(--text-secondary)]
                border border-[var(--border-light)]
                rounded-xl font-medium
                hover:bg-[var(--border-light)]
                transition-colors
              "
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
            <div className="flex-1 h-2 bg-[var(--bg-secondary)] rounded-full overflow-hidden">
              <div
                className="h-full bg-[var(--accent-primary)] transition-all duration-300"
                style={{ width: `${((currentIndex + 1) / dueItems.length) * 100}%` }}
              />
            </div>
            <span className="text-sm text-[var(--text-tertiary)]">
              {currentIndex + 1} / {dueItems.length}
            </span>
          </div>

          {/* Card */}
          <div className="bg-[var(--bg-card)] rounded-xl shadow-card overflow-hidden">
            {/* Question Side */}
            <div className="p-8">
              <div className="text-xs text-[var(--text-tertiary)] uppercase tracking-wide mb-2">
                {currentItem.content_type}
              </div>
              <h2 className="font-display text-h1 font-bold text-[var(--text-primary)] mb-4">
                {currentItem.title}
              </h2>

              <p className="text-[var(--text-secondary)] mb-6">
                What do you remember about this content?
              </p>

              {!showAnswer && (
                <button
                  onClick={() => setShowAnswer(true)}
                  className="
                    w-full py-3.5
                    bg-[var(--accent-primary)] text-white
                    rounded-xl font-medium
                    hover:bg-[var(--accent-hover)]
                    transition-colors
                  "
                >
                  Show Summary
                </button>
              )}
            </div>

            {/* Answer Side */}
            {showAnswer && (
              <div className="border-t border-[var(--border-light)] p-8 bg-[var(--bg-secondary)]">
                <h3 className="text-sm font-semibold text-[var(--text-secondary)] mb-3">
                  Summary
                </h3>
                <p className="text-[var(--text-primary)] mb-6">
                  {currentItem.summary || 'No summary available. View the full report for details.'}
                </p>

                <Link
                  href={`/reports/${currentItem.report_id}`}
                  className="text-[var(--accent-primary)] hover:text-[var(--accent-hover)] text-sm font-medium"
                  target="_blank"
                >
                  View Full Report →
                </Link>
              </div>
            )}

            {/* Rating Buttons */}
            {showAnswer && (
              <div className="border-t border-[var(--border-light)] p-6">
                <p className="text-center text-sm text-[var(--text-secondary)] mb-4">
                  How well did you remember?
                </p>
                <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                  {QUALITY_RATINGS.map((rating) => (
                    <button
                      key={rating.value}
                      onClick={() => handleRating(rating.value)}
                      className={`${rating.color} text-white py-3 px-2 rounded-lg transition-colors`}
                    >
                      <div className="font-semibold text-sm">{rating.label}</div>
                      <div className="text-xs opacity-80">{rating.value}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Item Info */}
          <div className="flex justify-between text-sm text-[var(--text-tertiary)]">
            <span>Repetitions: {currentItem.repetitions}</span>
            <span>Interval: {currentItem.interval} days</span>
            <span>Ease: {currentItem.ease_factor.toFixed(2)}</span>
          </div>
        </div>
      )}
    </div>
  );
}
