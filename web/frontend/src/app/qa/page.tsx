'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  askQuestion,
  getQuestionSuggestions,
  type QAAnswer,
  type QASource,
  type ModelKey,
} from '@/lib/api';

interface ConversationEntry {
  type: 'question' | 'answer';
  content: string;
  sources?: QASource[];
  tokens?: number;
  cost?: number;
  model?: string;
}

export default function QAPage() {
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversation, setConversation] = useState<ConversationEntry[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [followups, setFollowups] = useState<string[]>([]);
  const [model, setModel] = useState<ModelKey>('sonnet');

  // Load suggestions on mount
  useEffect(() => {
    const loadSuggestions = async () => {
      try {
        const data = await getQuestionSuggestions();
        setSuggestions(data.suggestions);
      } catch (err) {
        console.error('Failed to load suggestions:', err);
      }
    };
    loadSuggestions();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || loading) return;

    const currentQuestion = question.trim();
    setQuestion('');
    setLoading(true);
    setFollowups([]);

    // Add question to conversation
    setConversation((prev) => [
      ...prev,
      { type: 'question', content: currentQuestion },
    ]);

    try {
      const result = await askQuestion(currentQuestion, model);

      // Add answer to conversation
      setConversation((prev) => [
        ...prev,
        {
          type: 'answer',
          content: result.answer,
          sources: result.sources,
          tokens: result.tokens_used,
          cost: result.cost ?? undefined,
          model: result.model ?? undefined,
        },
      ]);

      // Set follow-up suggestions
      if (result.followup_suggestions) {
        setFollowups(result.followup_suggestions);
      }
    } catch (err) {
      console.error('Failed to get answer:', err);
      setConversation((prev) => [
        ...prev,
        {
          type: 'answer',
          content: 'Sorry, I encountered an error while processing your question. Please try again.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuestion(suggestion);
  };

  const handleFollowupClick = (followup: string) => {
    setQuestion(followup);
  };

  const clearConversation = () => {
    setConversation([]);
    setFollowups([]);
  };

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="font-display text-hero font-bold text-[var(--text-primary)] leading-tight">
            Ask Your Knowledge Base
          </h1>
          <p className="mt-2 text-lg text-[var(--text-secondary)]">
            Get AI-powered answers from your analyzed content with citations.
          </p>
        </div>

        {conversation.length > 0 && (
          <button
            onClick={clearConversation}
            className="px-4 py-2 text-sm text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
          >
            Clear conversation
          </button>
        )}
      </div>

      {/* Conversation History */}
      <div className="space-y-6 mb-8">
        {conversation.map((entry, index) => (
          <div
            key={index}
            className={`
              rounded-xl p-5
              ${
                entry.type === 'question'
                  ? 'bg-[var(--accent-primary)]/10 border border-[var(--accent-primary)]/20'
                  : 'bg-[var(--bg-card)] shadow-card'
              }
            `}
          >
            {entry.type === 'question' ? (
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-[var(--accent-primary)] flex items-center justify-center text-white font-semibold shrink-0">
                  Q
                </div>
                <p className="text-[var(--text-primary)] pt-1">
                  {entry.content}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-sage-500 flex items-center justify-center text-white font-semibold shrink-0">
                    A
                  </div>
                  <div className="flex-1 prose prose-stone dark:prose-invert max-w-none">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {entry.content}
                    </ReactMarkdown>
                  </div>
                </div>

                {/* Sources */}
                {entry.sources && entry.sources.length > 0 && (
                  <div className="ml-12 pt-4 border-t border-[var(--border-light)]">
                    <h4 className="text-sm font-semibold text-[var(--text-secondary)] mb-2">
                      Sources ({entry.sources.length})
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {entry.sources.map((source) => (
                        <Link
                          key={source.id}
                          href={`/reports/${source.id}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-[var(--bg-secondary)] text-sm text-[var(--text-secondary)] hover:bg-[var(--border-light)] transition-colors"
                        >
                          <span className="capitalize">{source.content_type}</span>
                          <span className="text-[var(--text-muted)]">|</span>
                          <span className="truncate max-w-[200px]">{source.title}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Usage info */}
                {(entry.tokens || entry.model) && (
                  <div className="ml-12 text-xs text-[var(--text-muted)]">
                    {entry.model && <span>{entry.model}</span>}
                    {entry.tokens && <span> • {entry.tokens} tokens</span>}
                    {entry.cost && <span> • ${entry.cost.toFixed(4)}</span>}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}

        {/* Loading indicator */}
        {loading && (
          <div className="bg-[var(--bg-card)] shadow-card rounded-xl p-5">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-sage-500 flex items-center justify-center text-white font-semibold shrink-0">
                A
              </div>
              <div className="pt-1">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-[var(--accent-primary)] rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-[var(--accent-primary)] rounded-full animate-bounce [animation-delay:0.2s]" />
                  <div className="w-2 h-2 bg-[var(--accent-primary)] rounded-full animate-bounce [animation-delay:0.4s]" />
                </div>
                <p className="text-sm text-[var(--text-tertiary)] mt-2">
                  Searching your knowledge base and generating answer...
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Follow-up suggestions */}
      {followups.length > 0 && !loading && (
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-[var(--text-secondary)] mb-2">
            Follow-up questions
          </h4>
          <div className="flex flex-wrap gap-2">
            {followups.map((followup, index) => (
              <button
                key={index}
                onClick={() => handleFollowupClick(followup)}
                className="px-3 py-2 text-sm bg-[var(--bg-secondary)] text-[var(--text-secondary)] rounded-lg hover:bg-[var(--border-light)] transition-colors text-left"
              >
                {followup}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Question input */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask a question about your analyzed content..."
            rows={3}
            className="
              w-full px-4 py-3.5
              bg-[var(--bg-card)]
              border border-[var(--border-light)]
              rounded-xl
              text-[var(--text-primary)]
              placeholder:text-[var(--text-muted)]
              focus:outline-none focus:border-[var(--accent-primary)]
              focus:ring-2 focus:ring-[var(--accent-primary)]/10
              transition-all duration-150
              resize-none
            "
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <select
              value={model}
              onChange={(e) => setModel(e.target.value as ModelKey)}
              className="
                px-3 py-2
                bg-[var(--bg-card)]
                border border-[var(--border-light)]
                rounded-lg
                text-[var(--text-primary)] text-sm
                focus:outline-none focus:border-[var(--accent-primary)]
                focus:ring-2 focus:ring-[var(--accent-primary)]/10
              "
            >
              <option value="haiku">Haiku (Fast)</option>
              <option value="sonnet">Sonnet (Balanced)</option>
              <option value="opus">Opus (Best)</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={!question.trim() || loading}
            className="
              px-6 py-2.5
              bg-[var(--accent-primary)] text-white
              rounded-xl font-medium
              hover:bg-[var(--accent-hover)]
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-all duration-150
              active:scale-[0.98]
            "
          >
            {loading ? 'Thinking...' : 'Ask'}
          </button>
        </div>
      </form>

      {/* Initial suggestions */}
      {conversation.length === 0 && suggestions.length > 0 && (
        <div className="mt-10">
          <h3 className="text-sm font-semibold text-[var(--text-secondary)] mb-4">
            Try asking...
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                className="
                  p-4 text-left
                  bg-[var(--bg-secondary)] rounded-xl
                  hover:bg-[var(--border-light)] transition-colors
                "
              >
                <span className="text-[var(--text-secondary)]">
                  {suggestion}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
