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
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'completed':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  const getProgressColor = (percent: number) => {
    if (percent >= 100) return 'bg-green-500';
    if (percent >= 75) return 'bg-blue-500';
    if (percent >= 50) return 'bg-yellow-500';
    return 'bg-gray-400';
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
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Learning Goals
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Track your learning progress with structured goals
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          + New Goal
        </button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {goals.length}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Total Goals</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="text-2xl font-bold text-green-600">
            {goals.filter((g) => g.status === 'active').length}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Active</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="text-2xl font-bold text-blue-600">
            {goals.filter((g) => g.status === 'completed').length}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Completed</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {goals.reduce((sum, g) => sum + g.current_count, 0)}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Reports Linked</div>
        </div>
      </div>

      {/* Goals List */}
      {goals.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="text-5xl mb-4">🎯</div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No learning goals yet
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Create your first goal to start tracking your learning journey
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Create Goal
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {goals.map((goal) => (
            <div
              key={goal.id}
              className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {goal.title}
                    </h3>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        goal.status
                      )}`}
                    >
                      {goal.status}
                    </span>
                  </div>
                  {goal.description && (
                    <p className="text-gray-600 dark:text-gray-400 mb-3">
                      {goal.description}
                    </p>
                  )}
                  {goal.keywords.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {goal.keywords.map((keyword) => (
                        <span
                          key={keyword}
                          className="px-2 py-1 bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 rounded text-sm"
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
                    className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="active">Active</option>
                    <option value="paused">Paused</option>
                    <option value="completed">Completed</option>
                  </select>
                  <button
                    onClick={() => handleDeleteGoal(goal.id)}
                    className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-4">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600 dark:text-gray-400">
                    Progress: {goal.current_count} / {goal.target_count}
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {Math.round(goal.progress_percent)}%
                  </span>
                </div>
                <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
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
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Create Learning Goal
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  value={newGoal.title}
                  onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="e.g., Learn Machine Learning"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  value={newGoal.description}
                  onChange={(e) =>
                    setNewGoal({ ...newGoal, description: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  rows={3}
                  placeholder="What do you want to achieve?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Keywords
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={keywordInput}
                    onChange={(e) => setKeywordInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addKeyword())}
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Add keyword"
                  />
                  <button
                    onClick={addKeyword}
                    className="px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
                  >
                    Add
                  </button>
                </div>
                {newGoal.keywords && newGoal.keywords.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {newGoal.keywords.map((keyword) => (
                      <span
                        key={keyword}
                        className="px-2 py-1 bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 rounded text-sm flex items-center gap-1"
                      >
                        {keyword}
                        <button
                          onClick={() => removeKeyword(keyword)}
                          className="hover:text-purple-600"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Target Count
                </label>
                <input
                  type="number"
                  value={newGoal.target_count}
                  onChange={(e) =>
                    setNewGoal({ ...newGoal, target_count: parseInt(e.target.value) || 10 })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  min={1}
                />
                <p className="text-xs text-gray-500 mt-1">
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
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateGoal}
                disabled={!newGoal.title.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
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
