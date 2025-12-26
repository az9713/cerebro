'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export function MarkdownRenderer({ content, className = '' }: MarkdownRendererProps) {
  return (
    <div className={`prose ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Custom heading rendering with anchor links
          h1: ({ children }) => (
            <h1 className="text-3xl font-bold mb-4 text-slate-900 pb-2 border-b border-slate-200">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-2xl font-semibold mt-8 mb-3 text-slate-800">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-xl font-semibold mt-6 mb-2 text-slate-700">
              {children}
            </h3>
          ),
          // Enhanced code blocks
          code: ({ className, children, ...props }) => {
            const isInline = !className;
            if (isInline) {
              return (
                <code className="bg-slate-100 px-1.5 py-0.5 rounded text-sm font-mono text-slate-800" {...props}>
                  {children}
                </code>
              );
            }
            return (
              <code className={className} {...props}>
                {children}
              </code>
            );
          },
          // Enhanced blockquotes
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-primary-500 pl-4 italic text-slate-600 my-4 bg-slate-50 py-2 rounded-r">
              {children}
            </blockquote>
          ),
          // Enhanced lists
          ul: ({ children }) => (
            <ul className="mb-4 pl-6 list-disc space-y-1">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="mb-4 pl-6 list-decimal space-y-1">
              {children}
            </ol>
          ),
          // Enhanced links
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-600 hover:text-primary-800 underline"
            >
              {children}
            </a>
          ),
          // Enhanced tables
          table: ({ children }) => (
            <div className="overflow-x-auto my-4">
              <table className="min-w-full border border-slate-200 rounded-lg">
                {children}
              </table>
            </div>
          ),
          th: ({ children }) => (
            <th className="bg-slate-100 px-4 py-2 text-left text-sm font-semibold text-slate-700 border-b border-slate-200">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="px-4 py-2 text-sm text-slate-700 border-b border-slate-100">
              {children}
            </td>
          ),
          // Enhanced horizontal rule
          hr: () => (
            <hr className="my-8 border-slate-200" />
          ),
          // Enhanced paragraphs
          p: ({ children }) => (
            <p className="mb-4 leading-relaxed text-slate-700">
              {children}
            </p>
          ),
          // Strong text
          strong: ({ children }) => (
            <strong className="font-semibold text-slate-900">
              {children}
            </strong>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
