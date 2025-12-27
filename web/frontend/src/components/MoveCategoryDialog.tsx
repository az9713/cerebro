'use client';

import { useState, useEffect } from 'react';
import { ContentType } from '@/lib/api';

interface MoveCategoryDialogProps {
  isOpen: boolean;
  currentCategory: ContentType;
  onMove: (newCategory: ContentType) => void;
  onCancel: () => void;
}

const CATEGORIES: { value: ContentType; label: string; description: string }[] = [
  { value: 'youtube', label: 'YouTube', description: 'Video content and transcripts' },
  { value: 'article', label: 'Article', description: 'Blog posts and web articles' },
  { value: 'paper', label: 'Paper', description: 'Research papers and academic content' },
  { value: 'other', label: 'Other', description: 'Miscellaneous content' },
];

export function MoveCategoryDialog({
  isOpen,
  currentCategory,
  onMove,
  onCancel,
}: MoveCategoryDialogProps) {
  const [selected, setSelected] = useState<ContentType>(currentCategory);

  // Reset selected when dialog opens
  useEffect(() => {
    if (isOpen) {
      setSelected(currentCategory);
    }
  }, [isOpen, currentCategory]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onCancel();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  const handleMove = () => {
    if (selected !== currentCategory) {
      onMove(selected);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onCancel}
      />

      {/* Dialog */}
      <div className="relative bg-bg-card border border-border-primary rounded-lg shadow-xl max-w-md w-full mx-4 p-6 animate-scale-in">
        <h2 className="text-xl font-semibold text-text-primary mb-2">
          Move Report
        </h2>
        <p className="text-text-secondary mb-4 text-sm">
          Select a new category for this report
        </p>

        {/* Category options */}
        <div className="space-y-2 mb-6">
          {CATEGORIES.map((cat) => (
            <label
              key={cat.value}
              className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                selected === cat.value
                  ? 'border-accent-primary bg-accent-primary/10'
                  : 'border-border-primary hover:bg-bg-tertiary'
              } ${
                cat.value === currentCategory ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <input
                type="radio"
                name="category"
                value={cat.value}
                checked={selected === cat.value}
                onChange={() => setSelected(cat.value)}
                disabled={cat.value === currentCategory}
                className="mt-0.5 accent-accent-primary"
              />
              <div>
                <div className="font-medium text-text-primary">
                  {cat.label}
                  {cat.value === currentCategory && (
                    <span className="ml-2 text-xs text-text-tertiary">(current)</span>
                  )}
                </div>
                <div className="text-sm text-text-secondary">{cat.description}</div>
              </div>
            </label>
          ))}
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium rounded-lg border border-border-primary text-text-secondary hover:bg-bg-tertiary transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleMove}
            disabled={selected === currentCategory}
            className="px-4 py-2 text-sm font-medium rounded-lg bg-accent-primary text-white hover:bg-accent-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Move
          </button>
        </div>
      </div>

      <style jsx global>{`
        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-scale-in {
          animation: scale-in 0.15s ease-out;
        }
      `}</style>
    </div>
  );
}
