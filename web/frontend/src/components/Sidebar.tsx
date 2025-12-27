'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ThemeToggle } from './ThemeProvider';

// Organized nav sections
const navSections = [
  {
    items: [
      { href: '/', label: 'Dashboard' },
      { href: '/reports', label: 'Reports' },
      { href: '/analyze', label: 'Analyze' },
      { href: '/search', label: 'Search' },
    ],
  },
  {
    items: [
      { href: '/discover', label: 'Discover' },
      { href: '/qa', label: 'Ask Q&A' },
      { href: '/compare', label: 'Compare' },
    ],
  },
  {
    items: [
      { href: '/review', label: 'Review' },
      { href: '/goals', label: 'Goals' },
      { href: '/knowledge-graph', label: 'Knowledge Graph' },
    ],
  },
  {
    items: [
      { href: '/logs', label: 'Activity' },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-[280px] bg-[var(--bg-secondary)] min-h-screen flex flex-col border-r border-[var(--border-light)]">
      {/* Brand */}
      <div className="px-6 py-8">
        <h1 className="font-display text-2xl font-bold text-[var(--accent-primary)]">
          Cerebro
        </h1>
        <p className="text-[var(--text-tertiary)] text-sm mt-1 font-body">
          Personal Knowledge OS
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4">
        {navSections.map((section, sectionIndex) => (
          <div key={sectionIndex}>
            {sectionIndex > 0 && (
              <div className="my-4 mx-2 border-t border-[var(--border-light)]" />
            )}
            <div className="space-y-1">
              {section.items.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== '/' && pathname.startsWith(item.href));

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`
                      group relative flex items-center px-4 py-2.5 rounded-lg
                      text-[15px] font-medium transition-all duration-150
                      ${
                        isActive
                          ? 'text-[var(--accent-primary)] bg-[var(--bg-card)]'
                          : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)]/50'
                      }
                    `}
                  >
                    {/* Active indicator bar with animation */}
                    <span
                      className={`
                        absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6
                        bg-[var(--accent-primary)] rounded-r-sm
                        transition-all duration-200 ease-out
                        ${isActive ? 'opacity-100 scale-y-100' : 'opacity-0 scale-y-0'}
                      `}
                    />
                    <span className="pl-1">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Quick Action */}
      <div className="px-6 py-4 border-t border-[var(--border-light)]">
        <Link
          href="/analyze"
          className="
            flex items-center justify-center gap-2 w-full
            px-4 py-2.5 rounded-lg
            bg-[var(--accent-primary)] text-white
            font-medium text-[15px]
            hover:bg-[var(--accent-hover)]
            transition-colors duration-150
            active:scale-[0.98]
          "
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          New Analysis
        </Link>
      </div>

      {/* Theme Toggle */}
      <div className="px-6 py-4 border-t border-[var(--border-light)]">
        <ThemeToggle />
      </div>
    </aside>
  );
}
