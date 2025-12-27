'use client';

import { useState, useEffect } from 'react';
import {
  fetchGoals,
  createGoal,
  updateGoalStatus,
  deleteGoal,
  LearningGoal,
  CreateGoalInput,
} from '@/lib/api';

export default function GoalsPage() {
  const [goals, setGoals] = useState<LearningGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newGoal, setNewGoal] = useState<CreateGoalInput>({
    title: '',
    description: '',
    keywords: [],
    target_count: 10,
  });
  const [keywordInput, setKeywordInput] = useState('');

  useEffect(() => {
    loadGoals();
  }, []);

  const loadGoals = async () => {
    try {
      const data = await fetchGoals();
      setGoals(data.goals);
    } catch (error) {
      console.error('Failed to load goals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGoal = async () => {
    if (!newGoal.title.trim()) return;

    try {
      const goal = await createGoal(newGoal);
      setGoals([...goals, goal]);
      setShowCreateModal(false);
      setNewGoal({ title: '', description: '', keywords: [], target_count: 10 });
      setKeywordInput('');
    } catch (error) {
      console.error('Failed to create goal:', error);
    }
  };

  const handleStatusChange = async (goalId: number, status: string) => {
    try {
      await updateGoalStatus(goalId, status);
      setGoals(
        goals.map((g) =>
          g.id === goalId ? { ...g, status: status as LearningGoal['status'] } : g
        )
      );
    } catch (error) {
      console.error('Failed to update goal:', error);
    }
  };

  const handleDeleteGoal = async (goalId: number) => {
    if (!confirm('Are you sure you want to delete this goal?')) return;

    try {
      await deleteGoal(goalId);
      setGoals(goals.filter((g) => g.id !== goalId));
    } catch (error) {
      console.error('Failed to delete goal:', error);
    }
  };

  const addKeyword = () => {
    if (keywordInput.trim() && !newGoal.keywords?.includes(keywordInput.trim())) {
      setNewGoal({
        ...newGoal,
        keywords: [...(newGoal.keywords || []), keywordInput.trim()],
      });
      setKeywordInput('');
    }
  };

  const removeKeyword = (keyword: string) => {
    setNewGoal({
      ...newGoal,
      keywords: newGoal.keywords?.filter((k) => k !== keyword) || [],
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-sage-100 text-sage-800 dark:bg-sage-900/30 dark:text-sage-300';
      case 'paused':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300';
      case 'completed':
        return 'bg-[var(--accent-primary)]/10 text-[var(--accent-primary)]';
      default:
        return 'bg-[var(--bg-secondary)] text-[var(--text-secondary)]';
    }
  };

  const getProgressColor = (percent: number) => {
    if (percent >= 100) return 'bg-sage-500';
    if (percent >= 75) return 'bg-[var(--accent-primary)]';
    if (percent >= 50) return 'bg-amber-500';
    return 'bg-stone-400';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-3">
          <svg className="w-6 h-6 text-[var(--accent-primary)] animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span className="text-[var(--text-secondary)]">Loading goals...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="font-display text-hero font-bold text-[var(--text-primary)] leading-tight">
            Learning Goals
          </h1>
          <p className="mt-2 text-lg text-[var(--text-secondary)]">
            Track your learning progress with structured goals.
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="
            px-5 py-2.5
            bg-[var(--accent-primary)] text-white
            rounded-xl font-medium
            hover:bg-[var(--accent-hover)]
            transition-colors
            flex items-center gap-2
          "
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Goal
        </button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <div className="bg-[var(--bg-card)] rounded-xl p-5 shadow-card">
          <div className="text-2xl font-bold text-[var(--text-primary)]">{goals.length}</div>
          <div className="text-sm text-[var(--text-tertiary)]">Total Goals</div>
        </div>
        <div className="bg-[var(--bg-card)] rounded-xl p-5 shadow-card">
          <div className="text-2xl font-bold text-sage-600">{goals.filter((g) => g.status === 'active').length}</div>
          <div className="text-sm text-[var(--text-tertiary)]">Active</div>
        </div>
        <div className="bg-[var(--bg-card)] rounded-xl p-5 shadow-card">
          <div className="text-2xl font-bold text-[var(--accent-primary)]">{goals.filter((g) => g.status === 'completed').length}</div>
          <div className="text-sm text-[var(--text-tertiary)]">Completed</div>
        </div>
        <div className="bg-[var(--bg-card)] rounded-xl p-5 shadow-card">
          <div className="text-2xl font-bold text-[var(--text-primary)]">{goals.reduce((sum, g) => sum + g.current_count, 0)}</div>
          <div className="text-sm text-[var(--text-tertiary)]">Reports Linked</div>
        </div>
      </div>

      {/* Goals List */}
      {goals.length === 0 ? (
        <div className="bg-[var(--bg-secondary)] rounded-xl p-12 text-center">
          <svg className="w-16 h-16 mx-auto mb-4 text-[var(--text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
          <h3 className="font-display font-bold text-lg text-[var(--text-primary)] mb-2">
            No learning goals yet
          </h3>
          <p className="text-[var(--text-secondary)] mb-6">
            Create your first goal to start tracking your learning journey.
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-2.5 bg-[var(--accent-primary)] text-white rounded-xl font-medium hover:bg-[var(--accent-hover)] transition-colors"
          >
            Create Goal
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {goals.map((goal, i) => (
            <div
              key={goal.id}
              className={`bg-[var(--bg-card)] rounded-xl p-6 shadow-card animate-slide-up stagger-${Math.min(i + 1, 5)}`}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-display font-bold text-lg text-[var(--text-primary)]">
                      {goal.title}
                    </h3>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(goal.status)}`}>
                      {goal.status}
                    </span>
                  </div>
                  {goal.description && (
                    <p className="text-[var(--text-secondary)] mb-3">{goal.description}</p>
                  )}
                  {goal.keywords.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {goal.keywords.map((keyword) => (
                        <span
                          key={keyword}
                          className="px-2.5 py-1 bg-type-paper/20 text-type-paper rounded-full text-sm"
                        >
                          {keyword}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={goal.status}
                    onChange={(e) => handleStatusChange(goal.id, e.target.value)}
                    className="
                      px-2 py-1
                      bg-[var(--bg-primary)]
                      border border-[var(--border-light)]
                      rounded-lg text-sm
                      text-[var(--text-primary)]
                      focus:outline-none focus:border-[var(--accent-primary)]
                    "
                  >
                    <option value="active">Active</option>
                    <option value="paused">Paused</option>
                    <option value="completed">Completed</option>
                  </select>
                  <button
                    onClick={() => handleDeleteGoal(goal.id)}
                    className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-4">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-[var(--text-tertiary)]">
                    Progress: {goal.current_count} / {goal.target_count}
                  </span>
                  <span className="font-medium text-[var(--text-primary)]">
                    {Math.round(goal.progress_percent)}%
                  </span>
                </div>
                <div className="w-full h-2 bg-[var(--bg-secondary)] rounded-full overflow-hidden">
                  <div
                    className={`h-full ${getProgressColor(goal.progress_percent)} transition-all duration-300`}
                    style={{ width: `${Math.min(100, goal.progress_percent)}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[var(--bg-card)] rounded-xl p-6 w-full max-w-md mx-4 shadow-lg">
            <h2 className="font-display text-h2 font-bold text-[var(--text-primary)] mb-6">
              Create Learning Goal
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  value={newGoal.title}
                  onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                  className="
                    w-full px-4 py-3
                    bg-[var(--bg-primary)]
                    border border-[var(--border-light)]
                    rounded-xl
                    text-[var(--text-primary)]
                    placeholder:text-[var(--text-muted)]
                    focus:outline-none focus:border-[var(--accent-primary)]
                    focus:ring-2 focus:ring-[var(--accent-primary)]/10
                  "
                  placeholder="e.g., Learn Machine Learning"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                  Description
                </label>
                <textarea
                  value={newGoal.description}
                  onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                  className="
                    w-full px-4 py-3
                    bg-[var(--bg-primary)]
                    border border-[var(--border-light)]
                    rounded-xl
                    text-[var(--text-primary)]
                    placeholder:text-[var(--text-muted)]
                    focus:outline-none focus:border-[var(--accent-primary)]
                    focus:ring-2 focus:ring-[var(--accent-primary)]/10
                    resize-none
                  "
                  rows={3}
                  placeholder="What do you want to achieve?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                  Keywords
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={keywordInput}
                    onChange={(e) => setKeywordInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addKeyword())}
                    className="
                      flex-1 px-4 py-2
                      bg-[var(--bg-primary)]
                      border border-[var(--border-light)]
                      rounded-xl
                      text-[var(--text-primary)]
                      placeholder:text-[var(--text-muted)]
                      focus:outline-none focus:border-[var(--accent-primary)]
                    "
                    placeholder="Add keyword"
                  />
                  <button
                    onClick={addKeyword}
                    className="px-4 py-2 bg-[var(--bg-secondary)] rounded-xl hover:bg-[var(--border-light)] transition-colors text-[var(--text-secondary)]"
                  >
                    Add
                  </button>
                </div>
                {newGoal.keywords && newGoal.keywords.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {newGoal.keywords.map((keyword) => (
                      <span
                        key={keyword}
                        className="px-2.5 py-1 bg-type-paper/20 text-type-paper rounded-full text-sm flex items-center gap-1"
                      >
                        {keyword}
                        <button
                          onClick={() => removeKeyword(keyword)}
                          className="hover:text-type-paper/70"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                  Target Count
                </label>
                <input
                  type="number"
                  value={newGoal.target_count}
                  onChange={(e) => setNewGoal({ ...newGoal, target_count: parseInt(e.target.value) || 10 })}
                  className="
                    w-full px-4 py-3
                    bg-[var(--bg-primary)]
                    border border-[var(--border-light)]
                    rounded-xl
                    text-[var(--text-primary)]
                    focus:outline-none focus:border-[var(--accent-primary)]
                    focus:ring-2 focus:ring-[var(--accent-primary)]/10
                  "
                  min={1}
                />
                <p className="text-xs text-[var(--text-muted)] mt-1">
                  Number of reports to consume for this goal
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setNewGoal({ title: '', description: '', keywords: [], target_count: 10 });
                  setKeywordInput('');
                }}
                className="px-5 py-2.5 text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateGoal}
                disabled={!newGoal.title.trim()}
                className="
                  px-5 py-2.5
                  bg-[var(--accent-primary)] text-white
                  rounded-xl font-medium
                  hover:bg-[var(--accent-hover)]
                  disabled:opacity-50 disabled:cursor-not-allowed
                  transition-colors
                "
              >
                Create Goal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
