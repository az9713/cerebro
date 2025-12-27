'use client';

import { AnalysisForm } from '@/components/AnalysisForm';

export default function AnalyzePage() {
  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-10">
        <h1 className="font-display text-hero font-bold text-[var(--text-primary)] leading-tight">
          Analyze Content
        </h1>
        <p className="mt-2 text-lg text-[var(--text-secondary)]">
          Submit a URL to analyze and extract insights.
        </p>
      </div>

      <div className="max-w-2xl">
        <AnalysisForm />

        <div className="mt-12 space-y-8">
          {/* Supported Content Types */}
          <section>
            <h2 className="font-display text-h2 font-bold text-[var(--text-primary)] mb-5">
              Supported Content Types
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* YouTube */}
              <div className="bg-[var(--bg-card)] rounded-xl p-5 shadow-card border-l-4 border-type-youtube">
                <div className="flex items-center gap-3 mb-3">
                  <svg className="w-5 h-5 text-type-youtube" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  <h3 className="font-display font-bold text-[var(--text-primary)]">YouTube Videos</h3>
                </div>
                <p className="text-sm text-[var(--text-secondary)]">
                  Extracts transcript and generates comprehensive analysis.
                </p>
              </div>

              {/* Articles */}
              <div className="bg-[var(--bg-card)] rounded-xl p-5 shadow-card border-l-4 border-type-article">
                <div className="flex items-center gap-3 mb-3">
                  <svg className="w-5 h-5 text-type-article" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                  </svg>
                  <h3 className="font-display font-bold text-[var(--text-primary)]">Web Articles</h3>
                </div>
                <p className="text-sm text-[var(--text-secondary)]">
                  Blogs, newsletters, news articles, and more.
                </p>
              </div>

              {/* Papers */}
              <div className="bg-[var(--bg-card)] rounded-xl p-5 shadow-card border-l-4 border-type-paper">
                <div className="flex items-center gap-3 mb-3">
                  <svg className="w-5 h-5 text-type-paper" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  <h3 className="font-display font-bold text-[var(--text-primary)]">arXiv Papers</h3>
                </div>
                <p className="text-sm text-[var(--text-secondary)]">
                  Research papers explained in plain English.
                </p>
              </div>
            </div>
          </section>

          {/* What You Get */}
          <section>
            <h2 className="font-display text-h2 font-bold text-[var(--text-primary)] mb-5">
              What You Get
            </h2>
            <div className="bg-[var(--bg-secondary)] rounded-xl p-6">
              <ul className="text-[var(--text-secondary)] space-y-3">
                <li className="flex items-start gap-3">
                  <span className="text-[var(--accent-primary)] mt-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </span>
                  Comprehensive summary (3-4 paragraphs)
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[var(--accent-primary)] mt-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </span>
                  All key takeaways and insights
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[var(--accent-primary)] mt-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </span>
                  Facts, statistics, and data points
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[var(--accent-primary)] mt-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </span>
                  Notable quotes with timestamps
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[var(--accent-primary)] mt-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </span>
                  Actionable next steps
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[var(--accent-primary)] mt-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </span>
                  Latent signals and implied insights
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[var(--accent-primary)] mt-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </span>
                  Related topics and further reading
                </li>
              </ul>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
