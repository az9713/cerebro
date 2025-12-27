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
          // Custom heading rendering - serif editorial style
          h1: ({ children }) => (
            <h1 className="font-display text-h1 font-bold mb-6 text-[var(--text-primary)] pb-4 border-b border-[var(--border-light)]">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="font-display text-h2 font-bold mt-12 mb-4 text-[var(--text-primary)]">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="font-display text-h3 font-bold mt-8 mb-3 text-[var(--text-primary)]">
              {children}
            </h3>
          ),
          // Enhanced code blocks
          code: ({ className, children, ...props }) => {
            const isInline = !className;
            if (isInline) {
              return (
                <code
                  className="font-mono text-[0.875em] bg-[var(--bg-secondary)] px-1.5 py-0.5 rounded text-[var(--accent-primary)]"
                  {...props}
                >
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
          // Enhanced pre (code blocks)
          pre: ({ children }) => (
            <pre className="font-mono bg-charcoal-400 text-cream-100 p-5 rounded-xl overflow-x-auto my-6 text-sm leading-relaxed">
              {children}
            </pre>
          ),
          // Enhanced blockquotes - editorial pull quote style
          blockquote: ({ children }) => (
            <blockquote className="relative border-l-[3px] border-[var(--accent-primary)] pl-6 my-8 font-display italic text-lg text-[var(--text-tertiary)]">
              {children}
            </blockquote>
          ),
          // Enhanced lists with terracotta markers
          ul: ({ children }) => (
            <ul className="mb-5 pl-0 space-y-2 list-none">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="mb-5 pl-6 list-decimal space-y-2 marker:text-[var(--accent-primary)] marker:font-medium">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="relative pl-6 text-[var(--text-secondary)] leading-relaxed before:content-[''] before:absolute before:left-0 before:top-[0.6em] before:w-1.5 before:h-1.5 before:bg-[var(--accent-primary)] before:rounded-full">
              {children}
            </li>
          ),
          // Enhanced links
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--accent-primary)] hover:text-[var(--accent-hover)] underline underline-offset-2 transition-colors"
            >
              {children}
            </a>
          ),
          // Enhanced tables
          table: ({ children }) => (
            <div className="overflow-x-auto my-8">
              <table className="min-w-full border-collapse">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="border-b-2 border-[var(--border-medium)]">
              {children}
            </thead>
          ),
          th: ({ children }) => (
            <th className="px-4 py-3 text-left text-sm font-semibold text-[var(--text-primary)] bg-[var(--bg-secondary)]">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="px-4 py-3 text-sm text-[var(--text-secondary)] border-b border-[var(--border-light)]">
              {children}
            </td>
          ),
          // Enhanced horizontal rule
          hr: () => (
            <hr className="my-12 border-none h-px bg-[var(--border-light)]" />
          ),
          // Enhanced paragraphs
          p: ({ children }) => (
            <p className="mb-5 leading-[1.8] text-[var(--text-secondary)]">
              {children}
            </p>
          ),
          // Strong text
          strong: ({ children }) => (
            <strong className="font-semibold text-[var(--text-primary)]">
              {children}
            </strong>
          ),
          // Emphasis
          em: ({ children }) => (
            <em className="italic text-[var(--text-secondary)]">
              {children}
            </em>
          ),
          // Images with rounded corners
          img: ({ src, alt }) => (
            <figure className="my-8">
              <img
                src={src}
                alt={alt || ''}
                className="rounded-xl w-full"
              />
              {alt && (
                <figcaption className="mt-3 text-center text-sm text-[var(--text-tertiary)] italic">
                  {alt}
                </figcaption>
              )}
            </figure>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
