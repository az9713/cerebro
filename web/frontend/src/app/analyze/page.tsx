'use client';

import { AnalysisForm } from '@/components/AnalysisForm';

export default function AnalyzePage() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">Analyze Content</h1>
      <p className="text-slate-600 dark:text-slate-400 mb-8">
        Submit a URL to analyze and extract insights.
      </p>

      <div className="max-w-2xl">
        <AnalysisForm />

        <div className="mt-12 space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-3">
              Supported Content Types
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <h3 className="font-medium text-red-800 dark:text-red-300 mb-1">YouTube Videos</h3>
                <p className="text-sm text-red-600 dark:text-red-400">
                  Extracts transcript and generates comprehensive analysis.
                </p>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <h3 className="font-medium text-blue-800 dark:text-blue-300 mb-1">Web Articles</h3>
                <p className="text-sm text-blue-600 dark:text-blue-400">
                  Blogs, newsletters, news articles, and more.
                </p>
              </div>

              <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
                <h3 className="font-medium text-purple-800 dark:text-purple-300 mb-1">arXiv Papers</h3>
                <p className="text-sm text-purple-600 dark:text-purple-400">
                  Research papers explained in plain English.
                </p>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-3">
              What You Get
            </h2>
            <ul className="text-slate-600 dark:text-slate-400 space-y-2">
              <li>• Comprehensive summary (3-4 paragraphs)</li>
              <li>• All key takeaways and insights</li>
              <li>• Facts, statistics, and data points</li>
              <li>• Notable quotes with timestamps</li>
              <li>• Actionable next steps</li>
              <li>• Latent signals and implied insights</li>
              <li>• Related topics and further reading</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
