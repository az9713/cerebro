'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ThemeToggle } from './ThemeProvider';

const navItems = [
  { href: '/', label: 'Dashboard', icon: '🏠' },
  { href: '/reports', label: 'Reports', icon: '📄' },
  { href: '/analyze', label: 'Analyze', icon: '🔍' },
  { href: '/logs', label: 'Activity', icon: '📊' },
  { href: '/search', label: 'Search', icon: '🔎' },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-slate-900 text-white min-h-screen p-4 flex flex-col">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-primary-400">Cerebro</h1>
        <p className="text-slate-400 text-sm">Personal OS</p>
      </div>

      <nav className="space-y-1 flex-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href ||
            (item.href !== '/' && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-primary-600 text-white'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-8 pt-8 border-t border-slate-700">
        <div className="text-slate-400 text-xs">
          <p>Quick Actions</p>
          <div className="mt-2 space-y-1">
            <Link href="/analyze" className="block hover:text-white">
              + New Analysis
            </Link>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-slate-700">
        <ThemeToggle />
      </div>
    </aside>
  );
}
