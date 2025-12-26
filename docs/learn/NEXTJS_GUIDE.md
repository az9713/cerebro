# Next.js Guide

This guide explains Next.js for developers who understand React basics but haven't built production web applications. We'll cover how Next.js extends React with routing, server-side rendering, and API routes.

---

## Table of Contents

1. [What is Next.js?](#what-is-nextjs)
2. [Why Next.js Over Plain React?](#why-nextjs-over-plain-react)
3. [Project Structure](#project-structure)
4. [The App Router](#the-app-router)
5. [Pages and Layouts](#pages-and-layouts)
6. [Navigation and Links](#navigation-and-links)
7. [Server vs Client Components](#server-vs-client-components)
8. [Data Fetching](#data-fetching)
9. [API Routes](#api-routes)
10. [Dynamic Routes](#dynamic-routes)
11. [Loading and Error States](#loading-and-error-states)
12. [Environment Variables](#environment-variables)
13. [Styling in Next.js](#styling-in-nextjs)
14. [Building and Deployment](#building-and-deployment)
15. [This Project's Structure](#this-projects-structure)
16. [Practice Exercises](#practice-exercises)

---

## What is Next.js?

**Next.js** is a React framework that adds features needed for production applications:

```
┌─────────────────────────────────────────────────────────────────┐
│                         Next.js                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                        React                              │  │
│  │  - Components                                             │  │
│  │  - JSX                                                    │  │
│  │  - State & Props                                          │  │
│  │  - Hooks                                                  │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│  + File-based Routing (automatic URLs from folder structure)    │
│  + Server-Side Rendering (HTML generated on server)             │
│  + API Routes (backend endpoints in same project)               │
│  + Built-in Optimization (images, fonts, scripts)               │
│  + Development Server (hot reloading, error overlay)            │
└─────────────────────────────────────────────────────────────────┘
```

### Analogy: React vs Next.js

Think of it like this:
- **React** is a car engine (powerful but needs assembly)
- **Next.js** is a complete car (engine + body + wheels + everything)

With plain React, you need to:
- Set up routing yourself (react-router)
- Configure bundling (Webpack, Vite)
- Handle server-side rendering manually
- Create a separate backend

With Next.js, all of this is included and configured.

---

## Why Next.js Over Plain React?

### Problem 1: Routing

**Plain React:**
```jsx
// Need to install react-router-dom
// Need to manually configure routes
import { BrowserRouter, Routes, Route } from 'react-router-dom';

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="/reports/:id" element={<ReportDetail />} />
            </Routes>
        </BrowserRouter>
    );
}
```

**Next.js:**
```
// Just create files in app/ folder - routing is automatic!
app/
├── page.tsx          → /
├── about/
│   └── page.tsx      → /about
└── reports/
    └── [id]/
        └── page.tsx  → /reports/:id
```

### Problem 2: SEO and Initial Load

**Plain React (Client-Side Rendering):**
```
1. Browser requests page
2. Server sends empty HTML + JavaScript
3. Browser downloads JS
4. Browser runs JS
5. React creates content
6. User finally sees page

Problem: Search engines see empty page
Problem: Slow initial load
```

**Next.js (Server-Side Rendering):**
```
1. Browser requests page
2. Server runs React, generates HTML
3. Server sends complete HTML
4. User sees page immediately!
5. Browser loads JS
6. Page becomes interactive

Benefit: Search engines see full content
Benefit: Fast initial load
```

### Problem 3: Backend APIs

**Plain React:** Need separate backend project

**Next.js:** API routes in same project
```
app/
├── page.tsx              ← Frontend
└── api/
    └── reports/
        └── route.ts      ← Backend API endpoint
```

---

## Project Structure

### Next.js 14 App Router Structure

```
my-project/
├── app/                      ← Main application folder
│   ├── layout.tsx            ← Root layout (wraps all pages)
│   ├── page.tsx              ← Home page (/)
│   ├── globals.css           ← Global styles
│   ├── about/
│   │   └── page.tsx          ← About page (/about)
│   ├── reports/
│   │   ├── page.tsx          ← Reports list (/reports)
│   │   └── [id]/
│   │       └── page.tsx      ← Report detail (/reports/123)
│   └── api/
│       └── reports/
│           └── route.ts      ← API endpoint (/api/reports)
├── components/               ← Reusable components
├── hooks/                    ← Custom React hooks
├── lib/                      ← Utility functions
├── public/                   ← Static files (images, etc.)
├── package.json              ← Dependencies
├── next.config.js            ← Next.js configuration
└── tsconfig.json             ← TypeScript configuration
```

### Special Files

| File | Purpose |
|------|---------|
| `page.tsx` | The UI for a route (required to make route accessible) |
| `layout.tsx` | Shared UI that wraps pages |
| `loading.tsx` | Loading UI shown while page loads |
| `error.tsx` | Error UI shown when something fails |
| `not-found.tsx` | 404 page |
| `route.ts` | API endpoint (no UI) |

---

## The App Router

Next.js 14 uses the **App Router** (in the `app/` folder). This is the modern approach.

### How Routing Works

**Folder = URL Path:**

```
app/
├── page.tsx              → /
├── about/
│   └── page.tsx          → /about
├── contact/
│   └── page.tsx          → /contact
└── blog/
    ├── page.tsx          → /blog
    └── [slug]/
        └── page.tsx      → /blog/my-post (dynamic)
```

### Creating a New Page

1. Create a folder with the URL name
2. Add `page.tsx` inside it

```tsx
// app/about/page.tsx
export default function AboutPage() {
    return (
        <div>
            <h1>About Us</h1>
            <p>Welcome to our application.</p>
        </div>
    );
}
```

That's it! Navigate to `/about` and you'll see this page.

---

## Pages and Layouts

### Pages

A `page.tsx` file makes a route publicly accessible:

```tsx
// app/reports/page.tsx
export default function ReportsPage() {
    return (
        <div>
            <h1>All Reports</h1>
            {/* Report list here */}
        </div>
    );
}
```

### Layouts

A `layout.tsx` wraps all pages in its folder (and subfolders):

```tsx
// app/layout.tsx (Root Layout - required)
import './globals.css';

export default function RootLayout({
    children,  // This is the page content
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body>
                <nav>
                    {/* Navigation shown on ALL pages */}
                    <a href="/">Home</a>
                    <a href="/reports">Reports</a>
                </nav>
                <main>
                    {children}  {/* Page content renders here */}
                </main>
                <footer>
                    {/* Footer shown on ALL pages */}
                </footer>
            </body>
        </html>
    );
}
```

### Nested Layouts

```
app/
├── layout.tsx              ← Root layout (nav, footer)
└── dashboard/
    ├── layout.tsx          ← Dashboard layout (sidebar)
    └── page.tsx            ← Dashboard page
```

```tsx
// app/dashboard/layout.tsx
export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="dashboard">
            <aside>
                {/* Sidebar only for dashboard pages */}
                <a href="/dashboard">Overview</a>
                <a href="/dashboard/settings">Settings</a>
            </aside>
            <section>
                {children}
            </section>
        </div>
    );
}
```

Result: Dashboard pages have both the root layout AND the dashboard layout.

---

## Navigation and Links

### Link Component

Use `Link` for client-side navigation (no full page reload):

```tsx
import Link from 'next/link';

export default function Navigation() {
    return (
        <nav>
            <Link href="/">Home</Link>
            <Link href="/reports">Reports</Link>
            <Link href="/reports/123">Report #123</Link>
        </nav>
    );
}
```

### Why Link Instead of `<a>`?

| `<a href>` | `<Link href>` |
|------------|---------------|
| Full page reload | Client-side navigation |
| Downloads all JS again | Keeps state, faster |
| Shows loading spinner | Instant feel |

### Programmatic Navigation

```tsx
'use client';  // Required for hooks

import { useRouter } from 'next/navigation';

export default function LoginForm() {
    const router = useRouter();

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        // ... do login ...

        // Navigate programmatically
        router.push('/dashboard');

        // Or replace (can't go back)
        router.replace('/dashboard');

        // Or refresh current page
        router.refresh();
    }

    return <form onSubmit={handleSubmit}>...</form>;
}
```

### Getting Current Route

```tsx
'use client';

import { usePathname, useSearchParams } from 'next/navigation';

export default function NavLink() {
    const pathname = usePathname();        // e.g., '/reports'
    const searchParams = useSearchParams(); // e.g., ?page=2

    return (
        <nav>
            <Link
                href="/reports"
                className={pathname === '/reports' ? 'active' : ''}
            >
                Reports
            </Link>
        </nav>
    );
}
```

---

## Server vs Client Components

This is **the most important concept** in Next.js 14.

### Server Components (Default)

By default, all components in `app/` are **Server Components**:

```tsx
// app/reports/page.tsx
// This runs on the SERVER

async function getReports() {
    // Can directly access database, file system, etc.
    const res = await fetch('http://localhost:8000/api/reports');
    return res.json();
}

export default async function ReportsPage() {
    const reports = await getReports();  // Runs on server!

    return (
        <ul>
            {reports.map(r => <li key={r.id}>{r.title}</li>)}
        </ul>
    );
}
```

**Server Components can:**
- Fetch data directly (async/await at component level)
- Access backend resources (database, file system)
- Keep sensitive data on server (API keys)
- Reduce JavaScript sent to browser

**Server Components cannot:**
- Use React hooks (useState, useEffect)
- Use browser APIs (window, document)
- Handle user events (onClick, onChange)

### Client Components

Add `'use client'` directive to make a Client Component:

```tsx
// components/Counter.tsx
'use client';  // ← This makes it a Client Component

import { useState } from 'react';

export default function Counter() {
    const [count, setCount] = useState(0);  // Hooks work!

    return (
        <button onClick={() => setCount(count + 1)}>
            Count: {count}
        </button>
    );
}
```

**Client Components can:**
- Use React hooks
- Use browser APIs
- Handle user interactions
- Maintain interactive state

**Client Components cannot:**
- Be async (no `async function Component()`)
- Directly access server resources

### The Pattern: Server Parent, Client Child

```tsx
// app/reports/page.tsx (Server Component)
import ReportList from '@/components/ReportList';

async function getReports() {
    const res = await fetch('http://localhost:8000/api/reports');
    return res.json();
}

export default async function ReportsPage() {
    const reports = await getReports();  // Fetch on server

    return (
        <div>
            <h1>Reports</h1>
            {/* Pass data to client component */}
            <ReportList reports={reports} />
        </div>
    );
}
```

```tsx
// components/ReportList.tsx (Client Component)
'use client';

import { useState } from 'react';

interface Report {
    id: number;
    title: string;
}

export default function ReportList({ reports }: { reports: Report[] }) {
    const [filter, setFilter] = useState('');

    const filtered = reports.filter(r =>
        r.title.toLowerCase().includes(filter.toLowerCase())
    );

    return (
        <div>
            <input
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                placeholder="Filter reports..."
            />
            <ul>
                {filtered.map(r => <li key={r.id}>{r.title}</li>)}
            </ul>
        </div>
    );
}
```

### Quick Reference

| Need | Component Type |
|------|---------------|
| Fetch data | Server |
| Database access | Server |
| useState, useEffect | Client |
| onClick, onChange | Client |
| Forms with state | Client |
| Static content | Server |
| SEO-important content | Server |

---

## Data Fetching

### In Server Components (Recommended)

```tsx
// app/reports/page.tsx
// No 'use client' - this is a Server Component

interface Report {
    id: number;
    title: string;
    type: string;
}

async function getReports(): Promise<Report[]> {
    const res = await fetch('http://localhost:8000/api/reports', {
        // Caching options
        cache: 'no-store',  // Always fresh data
        // OR
        // next: { revalidate: 60 }  // Refresh every 60 seconds
    });

    if (!res.ok) {
        throw new Error('Failed to fetch reports');
    }

    return res.json();
}

export default async function ReportsPage() {
    const reports = await getReports();

    return (
        <div>
            <h1>Reports ({reports.length})</h1>
            <ul>
                {reports.map(report => (
                    <li key={report.id}>
                        {report.title} - {report.type}
                    </li>
                ))}
            </ul>
        </div>
    );
}
```

### In Client Components

```tsx
// components/ReportSearch.tsx
'use client';

import { useState, useEffect } from 'react';

interface Report {
    id: number;
    title: string;
}

export default function ReportSearch() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<Report[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!query) {
            setResults([]);
            return;
        }

        const search = async () => {
            setLoading(true);
            const res = await fetch(`/api/reports/search?q=${query}`);
            const data = await res.json();
            setResults(data);
            setLoading(false);
        };

        // Debounce: wait 300ms after typing stops
        const timer = setTimeout(search, 300);
        return () => clearTimeout(timer);
    }, [query]);

    return (
        <div>
            <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search reports..."
            />
            {loading && <p>Searching...</p>}
            <ul>
                {results.map(r => <li key={r.id}>{r.title}</li>)}
            </ul>
        </div>
    );
}
```

### Parallel Data Fetching

```tsx
// Fetch multiple resources in parallel
export default async function DashboardPage() {
    // Start all fetches simultaneously
    const [reports, logs, stats] = await Promise.all([
        fetch('/api/reports').then(r => r.json()),
        fetch('/api/logs/today').then(r => r.json()),
        fetch('/api/stats').then(r => r.json()),
    ]);

    return (
        <div>
            <ReportsSection reports={reports} />
            <LogsSection logs={logs} />
            <StatsSection stats={stats} />
        </div>
    );
}
```

---

## API Routes

Next.js can handle backend API endpoints in the same project.

### Creating an API Route

```tsx
// app/api/reports/route.ts
import { NextResponse } from 'next/server';

// Handle GET requests
export async function GET() {
    // In real app: fetch from database
    const reports = [
        { id: 1, title: 'Report 1' },
        { id: 2, title: 'Report 2' },
    ];

    return NextResponse.json(reports);
}

// Handle POST requests
export async function POST(request: Request) {
    const body = await request.json();

    // Validate
    if (!body.title) {
        return NextResponse.json(
            { error: 'Title is required' },
            { status: 400 }
        );
    }

    // In real app: save to database
    const newReport = { id: Date.now(), ...body };

    return NextResponse.json(newReport, { status: 201 });
}
```

### API Route with Query Parameters

```tsx
// app/api/reports/search/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q') || '';
    const type = searchParams.get('type');

    // Filter reports (in real app: database query)
    let results = allReports.filter(r =>
        r.title.toLowerCase().includes(query.toLowerCase())
    );

    if (type) {
        results = results.filter(r => r.type === type);
    }

    return NextResponse.json(results);
}
```

### API Route with Dynamic Segment

```tsx
// app/api/reports/[id]/route.ts
import { NextResponse } from 'next/server';

// GET /api/reports/123
export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    const id = parseInt(params.id);

    // Find report (in real app: database query)
    const report = reports.find(r => r.id === id);

    if (!report) {
        return NextResponse.json(
            { error: 'Report not found' },
            { status: 404 }
        );
    }

    return NextResponse.json(report);
}

// DELETE /api/reports/123
export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    const id = parseInt(params.id);

    // Delete report (in real app: database delete)
    // ...

    return new NextResponse(null, { status: 204 });
}
```

### Calling API Routes from Components

```tsx
// From client component
'use client';

async function submitReport(data: FormData) {
    const response = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            title: data.get('title'),
            content: data.get('content'),
        }),
    });

    if (!response.ok) {
        throw new Error('Failed to create report');
    }

    return response.json();
}
```

---

## Dynamic Routes

### Basic Dynamic Route

```
app/
└── reports/
    └── [id]/
        └── page.tsx    → /reports/1, /reports/2, /reports/abc
```

```tsx
// app/reports/[id]/page.tsx
interface Props {
    params: { id: string };
}

export default async function ReportPage({ params }: Props) {
    const report = await fetch(
        `http://localhost:8000/api/reports/${params.id}`
    ).then(r => r.json());

    return (
        <div>
            <h1>{report.title}</h1>
            <p>{report.content}</p>
        </div>
    );
}
```

### Multiple Dynamic Segments

```
app/
└── blog/
    └── [year]/
        └── [slug]/
            └── page.tsx    → /blog/2024/my-post
```

```tsx
// app/blog/[year]/[slug]/page.tsx
interface Props {
    params: { year: string; slug: string };
}

export default function BlogPost({ params }: Props) {
    return (
        <div>
            Year: {params.year}, Slug: {params.slug}
        </div>
    );
}
```

### Catch-All Routes

```
app/
└── docs/
    └── [...slug]/
        └── page.tsx    → /docs/a, /docs/a/b, /docs/a/b/c
```

```tsx
// app/docs/[...slug]/page.tsx
interface Props {
    params: { slug: string[] };  // Array!
}

export default function DocsPage({ params }: Props) {
    // /docs/api/rest/endpoints → slug = ['api', 'rest', 'endpoints']
    return <div>Path: {params.slug.join('/')}</div>;
}
```

### Optional Catch-All

```
app/
└── docs/
    └── [[...slug]]/
        └── page.tsx    → /docs AND /docs/a AND /docs/a/b
```

Double brackets make the parameter optional.

---

## Loading and Error States

### Loading UI

Create `loading.tsx` next to `page.tsx`:

```tsx
// app/reports/loading.tsx
export default function Loading() {
    return (
        <div className="loading">
            <div className="spinner" />
            <p>Loading reports...</p>
        </div>
    );
}
```

This shows automatically while `page.tsx` loads data.

### Error Handling

Create `error.tsx` next to `page.tsx`:

```tsx
// app/reports/error.tsx
'use client';  // Error components must be Client Components

interface Props {
    error: Error;
    reset: () => void;  // Function to retry
}

export default function Error({ error, reset }: Props) {
    return (
        <div className="error">
            <h2>Something went wrong!</h2>
            <p>{error.message}</p>
            <button onClick={reset}>Try again</button>
        </div>
    );
}
```

### 404 Not Found

Create `not-found.tsx`:

```tsx
// app/reports/[id]/not-found.tsx
import Link from 'next/link';

export default function NotFound() {
    return (
        <div>
            <h2>Report Not Found</h2>
            <p>Could not find the requested report.</p>
            <Link href="/reports">Back to Reports</Link>
        </div>
    );
}
```

Trigger it from your page:

```tsx
// app/reports/[id]/page.tsx
import { notFound } from 'next/navigation';

export default async function ReportPage({ params }: Props) {
    const report = await getReport(params.id);

    if (!report) {
        notFound();  // Shows not-found.tsx
    }

    return <div>{report.title}</div>;
}
```

---

## Environment Variables

### Setting Up

Create `.env.local` in project root:

```env
# .env.local
DATABASE_URL=postgresql://localhost:5432/mydb
ANTHROPIC_API_KEY=sk-ant-...
NEXT_PUBLIC_APP_NAME=Personal OS
```

### Server vs Client Variables

| Prefix | Access | Use Case |
|--------|--------|----------|
| None | Server only | Database URLs, API keys |
| `NEXT_PUBLIC_` | Server + Client | Public config |

```tsx
// Server Component or API Route
const dbUrl = process.env.DATABASE_URL;  // Works
const apiKey = process.env.ANTHROPIC_API_KEY;  // Works

// Client Component
const appName = process.env.NEXT_PUBLIC_APP_NAME;  // Works
const apiKey = process.env.ANTHROPIC_API_KEY;  // undefined!
```

### Using Environment Variables

```tsx
// app/api/analyze/route.ts
export async function POST(request: Request) {
    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (!apiKey) {
        return NextResponse.json(
            { error: 'API key not configured' },
            { status: 500 }
        );
    }

    // Use the key safely on server
    const response = await fetch('https://api.anthropic.com/...', {
        headers: {
            'x-api-key': apiKey,
        },
    });
    // ...
}
```

---

## Styling in Next.js

### Global CSS

```css
/* app/globals.css */
* {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
}

body {
    font-family: system-ui, sans-serif;
}
```

```tsx
// app/layout.tsx
import './globals.css';  // Import once in root layout
```

### CSS Modules

```css
/* components/Button.module.css */
.button {
    padding: 0.5rem 1rem;
    background: blue;
    color: white;
    border: none;
    border-radius: 4px;
}

.button:hover {
    background: darkblue;
}

.primary {
    background: green;
}
```

```tsx
// components/Button.tsx
import styles from './Button.module.css';

export default function Button({ variant = 'default', children }) {
    return (
        <button className={`${styles.button} ${styles[variant]}`}>
            {children}
        </button>
    );
}
```

### Tailwind CSS (Used in This Project)

```tsx
// components/Button.tsx
export default function Button({ children }) {
    return (
        <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
            {children}
        </button>
    );
}
```

Tailwind classes are utility-first:
- `px-4` = padding-left and padding-right: 1rem
- `py-2` = padding-top and padding-bottom: 0.5rem
- `bg-blue-500` = background color blue (500 shade)
- `text-white` = text color white
- `rounded` = border-radius
- `hover:bg-blue-600` = blue-600 on hover

---

## Building and Deployment

### Development

```bash
npm run dev
# Runs on http://localhost:3000
# Hot reloading enabled
# Error overlay shown
```

### Production Build

```bash
npm run build
# Creates optimized .next/ folder
# Pre-renders static pages
# Bundles JavaScript
```

### Start Production Server

```bash
npm run start
# Serves the built application
# No hot reloading
# Production optimizations
```

### What Gets Built

```
.next/
├── cache/          ← Build cache
├── server/         ← Server-side code
├── static/         ← Static assets
└── standalone/     ← Standalone deployment (optional)
```

---

## This Project's Structure

The Personal OS frontend follows this structure:

```
web/frontend/
├── src/
│   ├── app/
│   │   ├── layout.tsx         ← Root layout with sidebar
│   │   ├── page.tsx           ← Dashboard (/)
│   │   ├── analyze/
│   │   │   └── page.tsx       ← Analysis form (/analyze)
│   │   ├── reports/
│   │   │   └── page.tsx       ← Reports list (/reports)
│   │   ├── logs/
│   │   │   └── page.tsx       ← Activity logs (/logs)
│   │   └── search/
│   │       └── page.tsx       ← Search (/search)
│   ├── components/
│   │   ├── Sidebar.tsx        ← Navigation sidebar
│   │   ├── AnalysisForm.tsx   ← URL input form
│   │   ├── ReportCard.tsx     ← Report display card
│   │   └── ProgressIndicator.tsx  ← Analysis progress
│   └── hooks/
│       └── useAnalysisStatus.ts   ← Poll for job status
├── tailwind.config.ts         ← Tailwind configuration
└── next.config.js             ← Next.js configuration
```

### Data Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                     Frontend (Next.js)                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   ┌─────────────┐    ┌─────────────┐    ┌─────────────────┐    │
│   │   page.tsx  │───▶│  Component  │───▶│ useAnalysisStatus│    │
│   │(Server)     │    │  (Client)   │    │    (Hook)        │    │
│   └─────────────┘    └─────────────┘    └────────┬────────┘    │
│                                                   │              │
└───────────────────────────────────────────────────┼──────────────┘
                                                    │
                                                    ▼
                                        ┌─────────────────────┐
                                        │  Backend (FastAPI)  │
                                        │  localhost:8000     │
                                        └─────────────────────┘
```

---

## Practice Exercises

### Exercise 1: Create a New Page

Create a page at `/settings` that shows a settings form.

1. Create `app/settings/page.tsx`
2. Add a Link to it in the sidebar
3. Make sure it shows in the layout

### Exercise 2: Add a Dynamic Route

Create a route for viewing individual log entries at `/logs/[date]`.

1. Create `app/logs/[date]/page.tsx`
2. Extract the date from params
3. Display the log for that date

### Exercise 3: Create an API Route

Create an API endpoint at `/api/health` that returns the server status.

1. Create `app/api/health/route.ts`
2. Return JSON: `{ status: 'ok', timestamp: ... }`
3. Test with curl or browser

### Exercise 4: Add Loading State

Add a loading state to the reports page.

1. Create `app/reports/loading.tsx`
2. Show a spinner or skeleton
3. Test by adding artificial delay to data fetch

### Exercise 5: Handle Errors

Add error handling to a page.

1. Create `app/reports/error.tsx`
2. Show error message and retry button
3. Test by temporarily breaking the API call

---

## Summary

| Concept | What It Does |
|---------|-------------|
| App Router | File-based routing in `app/` folder |
| `page.tsx` | Makes a route accessible |
| `layout.tsx` | Wraps pages with shared UI |
| Server Components | Default, can fetch data, no hooks |
| Client Components | Use `'use client'`, can use hooks |
| `Link` | Client-side navigation |
| `loading.tsx` | Loading UI while fetching |
| `error.tsx` | Error boundary for page |
| `route.ts` | API endpoint handler |
| `[param]` | Dynamic route segment |
| Environment Variables | `NEXT_PUBLIC_` for client access |

---

## What's Next?

Now that you understand Next.js, move on to:

1. **[FASTAPI_GUIDE.md](FASTAPI_GUIDE.md)** - Build the backend
2. **[ANTHROPIC_CLAUDE_API.md](ANTHROPIC_CLAUDE_API.md)** - AI integration

---

*Next.js Guide - Created 2025-12-25*

*Built with [Claude Code](https://claude.ai/code) powered by Claude Opus 4.5*
