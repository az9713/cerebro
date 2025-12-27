# SWR Data Fetching Guide

This guide explains SWR (stale-while-revalidate), a React data fetching library that simplifies API calls, caching, and state management. Essential for building responsive, real-time UIs.

---

## Table of Contents

1. [What is SWR?](#what-is-swr)
2. [Installation](#installation)
3. [Basic Usage](#basic-usage)
4. [Understanding the Return Values](#understanding-the-return-values)
5. [Conditional Fetching](#conditional-fetching)
6. [Mutating Data](#mutating-data)
7. [Revalidation Strategies](#revalidation-strategies)
8. [Global Configuration](#global-configuration)
9. [Error Handling](#error-handling)
10. [Pagination and Infinite Loading](#pagination-and-infinite-loading)
11. [Comparison: SWR vs useEffect](#comparison-swr-vs-useeffect)
12. [This Project's Implementation](#this-projects-implementation)
13. [Practice Exercises](#practice-exercises)

---

## What is SWR?

**SWR** (stale-while-revalidate) is a React Hooks library for data fetching developed by Vercel (creators of Next.js). The name comes from an HTTP cache invalidation strategy:

1. **Stale**: Return cached data immediately (fast UI)
2. **While**: In the background...
3. **Revalidate**: Fetch fresh data from the server

### Visual Representation

```
┌─────────────────────────────────────────────────────────────────┐
│                    SWR Request Flow                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  User clicks button                                              │
│       │                                                          │
│       ▼                                                          │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ Step 1: Return CACHED data immediately (if available)      ││
│  │         → User sees UI instantly (no loading spinner)      ││
│  └─────────────────────────────────────────────────────────────┘│
│       │                                                          │
│       ▼                                                          │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ Step 2: Fetch FRESH data in background                      ││
│  │         → API request happens silently                      ││
│  └─────────────────────────────────────────────────────────────┘│
│       │                                                          │
│       ▼                                                          │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ Step 3: Update UI with fresh data                           ││
│  │         → Cache is updated for next time                    ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Why Use SWR?

| Feature | Without SWR | With SWR |
|---------|-------------|----------|
| Caching | Manual (useState/useRef) | Automatic |
| Loading state | Manual | Built-in |
| Error handling | Manual try/catch | Built-in |
| Revalidation | Manual timers | Automatic |
| Deduplication | None | Automatic |
| Focus revalidation | None | Automatic |

---

## Installation

```bash
# Install SWR
npm install swr

# Already included in this project
# Check package.json for version
```

---

## Basic Usage

### Minimal Example

```tsx
import useSWR from 'swr';

// Fetcher function - tells SWR how to get data
const fetcher = (url: string) => fetch(url).then(res => res.json());

function Profile() {
  const { data, error, isLoading } = useSWR('/api/user', fetcher);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading profile</div>;

  return <div>Hello, {data.name}!</div>;
}
```

### Understanding the Hook

```tsx
const { data, error, isLoading, isValidating, mutate } = useSWR(key, fetcher);
```

**Parameters:**
- `key`: A unique string (usually URL) that identifies the request
- `fetcher`: A function that fetches the data

**Returns:**
- `data`: The fetched data (or undefined if not loaded)
- `error`: Any error thrown by fetcher
- `isLoading`: True on first load (no cache yet)
- `isValidating`: True when revalidating (background refresh)
- `mutate`: Function to manually update cache

---

## Understanding the Return Values

### Loading States Explained

```tsx
function Component() {
  const { data, error, isLoading, isValidating } = useSWR('/api/data', fetcher);

  // First load - no cache exists
  // isLoading: true, isValidating: true, data: undefined

  // After first load - data cached
  // isLoading: false, isValidating: false, data: {...}

  // Background revalidation
  // isLoading: false, isValidating: true, data: {...} (stale)

  // After revalidation completes
  // isLoading: false, isValidating: false, data: {...} (fresh)
}
```

### State Diagram

```
┌───────────────────────────────────────────────────────────────────┐
│                        SWR States                                  │
├───────────────────────────────────────────────────────────────────┤
│                                                                    │
│  Initial Mount           Cached + Revalidating     Fresh Data     │
│  ─────────────           ────────────────────      ──────────     │
│                                                                    │
│  isLoading: true         isLoading: false          isLoading: false│
│  isValidating: true      isValidating: true        isValidating: false│
│  data: undefined         data: {...} (stale)       data: {...} (fresh)│
│  error: undefined        error: undefined          error: undefined│
│                                                                    │
│        │                        │                       │          │
│        ▼                        ▼                       ▼          │
│  Show skeleton           Show cached data        Show fresh data  │
│  or loading UI           (optionally show        UI is up-to-date │
│                          refresh indicator)                        │
│                                                                    │
└───────────────────────────────────────────────────────────────────┘
```

### Practical Pattern

```tsx
function ReportList() {
  const { data, error, isLoading, isValidating } = useSWR('/api/reports', fetcher);

  // Show skeleton on first load only
  if (isLoading) {
    return <ReportSkeleton count={5} />;
  }

  if (error) {
    return <ErrorMessage message="Failed to load reports" />;
  }

  return (
    <div>
      {/* Show subtle indicator during background refresh */}
      {isValidating && <RefreshIndicator />}

      {data.map(report => (
        <ReportCard key={report.id} report={report} />
      ))}
    </div>
  );
}
```

---

## Conditional Fetching

### Fetch Only When Condition is Met

```tsx
function UserReports({ userId }) {
  // Only fetch when userId exists
  // Pass null to disable fetching
  const { data } = useSWR(
    userId ? `/api/users/${userId}/reports` : null,
    fetcher
  );

  // ...
}
```

### Dependent Fetching

```tsx
function UserProfile({ username }) {
  // First fetch: get user details
  const { data: user } = useSWR(`/api/users/${username}`, fetcher);

  // Second fetch: get user's reports (depends on user.id)
  const { data: reports } = useSWR(
    user ? `/api/users/${user.id}/reports` : null,  // Wait for user
    fetcher
  );

  // ...
}
```

---

## Mutating Data

### Manual Cache Update

```tsx
function ReportCard({ report }) {
  const { mutate } = useSWR(`/api/reports/${report.id}`, fetcher);

  async function handleFavorite() {
    // Optimistically update cache immediately
    mutate({ ...report, is_favorite: true }, false);

    // Then send actual API request
    await fetch(`/api/reports/${report.id}/favorite`, { method: 'POST' });

    // Revalidate to ensure data is correct
    mutate();
  }

  return (
    <div>
      <h3>{report.title}</h3>
      <button onClick={handleFavorite}>
        {report.is_favorite ? '★' : '☆'}
      </button>
    </div>
  );
}
```

### Global Mutate

```tsx
import { mutate } from 'swr';

async function createReport(data) {
  const response = await fetch('/api/reports', {
    method: 'POST',
    body: JSON.stringify(data),
  });

  // Revalidate all components using this key
  mutate('/api/reports');  // Triggers refetch

  return response.json();
}
```

### Optimistic Updates Pattern

```tsx
async function deleteReport(reportId) {
  const { data, mutate } = useSWR('/api/reports', fetcher);

  // 1. Optimistically remove from list
  mutate(
    data.filter(r => r.id !== reportId),  // New data
    false  // Don't revalidate yet
  );

  try {
    // 2. Send delete request
    await fetch(`/api/reports/${reportId}`, { method: 'DELETE' });

    // 3. Revalidate to confirm
    mutate();
  } catch (error) {
    // 4. Revert on error (refetch original data)
    mutate();
    throw error;
  }
}
```

---

## Revalidation Strategies

### Automatic Revalidation

SWR automatically revalidates when:

```tsx
const { data } = useSWR('/api/data', fetcher, {
  revalidateOnFocus: true,      // When window regains focus (default: true)
  revalidateOnReconnect: true,  // When network reconnects (default: true)
  revalidateIfStale: true,      // When data is stale (default: true)
});
```

### Interval Revalidation

```tsx
// Refresh every 5 seconds
const { data } = useSWR('/api/live-data', fetcher, {
  refreshInterval: 5000,  // milliseconds
});

// Conditional interval (only when visible)
const { data } = useSWR('/api/notifications', fetcher, {
  refreshInterval: 3000,
  refreshWhenHidden: false,  // Don't refresh in background tabs
  refreshWhenOffline: false, // Don't refresh when offline
});
```

### Manual Revalidation

```tsx
function Dashboard() {
  const { data, mutate } = useSWR('/api/stats', fetcher);

  return (
    <div>
      <button onClick={() => mutate()}>Refresh</button>
      <Stats data={data} />
    </div>
  );
}
```

---

## Global Configuration

### SWR Config Provider

```tsx
// app/layout.tsx or _app.tsx
import { SWRConfig } from 'swr';

const globalFetcher = (url: string) =>
  fetch(url).then(res => {
    if (!res.ok) throw new Error('API error');
    return res.json();
  });

export default function App({ children }) {
  return (
    <SWRConfig
      value={{
        fetcher: globalFetcher,
        revalidateOnFocus: true,
        dedupingInterval: 2000,  // Dedupe requests within 2s
        errorRetryCount: 3,
      }}
    >
      {children}
    </SWRConfig>
  );
}

// Now components don't need to pass fetcher
function Component() {
  const { data } = useSWR('/api/data');  // Uses global fetcher
}
```

### Configuration Options

| Option | Default | Description |
|--------|---------|-------------|
| `fetcher` | - | Default fetcher function |
| `revalidateOnFocus` | true | Revalidate when window focuses |
| `revalidateOnReconnect` | true | Revalidate when network reconnects |
| `refreshInterval` | 0 | Polling interval (0 = disabled) |
| `dedupingInterval` | 2000 | Dedupe requests within this time |
| `errorRetryCount` | 5 | Number of error retries |
| `errorRetryInterval` | 5000 | Delay between retries |
| `shouldRetryOnError` | true | Whether to retry on error |

---

## Error Handling

### Basic Error Handling

```tsx
function Component() {
  const { data, error, isLoading } = useSWR('/api/data', fetcher);

  if (error) {
    return <ErrorMessage error={error} />;
  }

  if (isLoading) {
    return <Loading />;
  }

  return <Content data={data} />;
}
```

### Custom Error Handling in Fetcher

```tsx
const fetcher = async (url: string) => {
  const response = await fetch(url);

  if (!response.ok) {
    const error = new Error('API request failed');
    error.status = response.status;
    error.info = await response.json();
    throw error;
  }

  return response.json();
};

function Component() {
  const { data, error } = useSWR('/api/data', fetcher);

  if (error) {
    if (error.status === 404) {
      return <NotFound />;
    }
    if (error.status === 403) {
      return <Forbidden />;
    }
    return <GenericError />;
  }

  // ...
}
```

### Error Retry Configuration

```tsx
const { data } = useSWR('/api/data', fetcher, {
  // Custom retry logic
  onErrorRetry: (error, key, config, revalidate, { retryCount }) => {
    // Don't retry on 404
    if (error.status === 404) return;

    // Don't retry more than 3 times
    if (retryCount >= 3) return;

    // Retry after 5 seconds
    setTimeout(() => revalidate({ retryCount }), 5000);
  },
});
```

---

## Pagination and Infinite Loading

### Simple Pagination

```tsx
function PaginatedReports() {
  const [page, setPage] = useState(1);

  const { data, isLoading } = useSWR(
    `/api/reports?page=${page}&limit=10`,
    fetcher
  );

  return (
    <div>
      {data?.items.map(report => (
        <ReportCard key={report.id} report={report} />
      ))}

      <Pagination
        currentPage={page}
        totalPages={data?.total_pages}
        onPageChange={setPage}
      />
    </div>
  );
}
```

### Infinite Loading with useSWRInfinite

```tsx
import useSWRInfinite from 'swr/infinite';

function InfiniteReports() {
  const getKey = (pageIndex, previousPageData) => {
    // Return null to stop fetching
    if (previousPageData && !previousPageData.items.length) return null;

    // Return API URL for this page
    return `/api/reports?page=${pageIndex + 1}&limit=10`;
  };

  const { data, size, setSize, isLoading, isValidating } = useSWRInfinite(
    getKey,
    fetcher
  );

  // Flatten all pages into single array
  const reports = data ? data.flatMap(page => page.items) : [];
  const isLoadingMore = isLoading || (size > 0 && data && typeof data[size - 1] === 'undefined');
  const isEmpty = data?.[0]?.items.length === 0;
  const isReachingEnd = isEmpty || (data && data[data.length - 1]?.items.length < 10);

  return (
    <div>
      {reports.map(report => (
        <ReportCard key={report.id} report={report} />
      ))}

      <button
        onClick={() => setSize(size + 1)}
        disabled={isLoadingMore || isReachingEnd}
      >
        {isLoadingMore ? 'Loading...' : isReachingEnd ? 'No more' : 'Load More'}
      </button>
    </div>
  );
}
```

---

## Comparison: SWR vs useEffect

### Without SWR (Traditional Approach)

```tsx
function Reports() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      try {
        setLoading(true);
        const response = await fetch('/api/reports');
        const json = await response.json();

        if (!cancelled) {
          setData(json);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchData();

    return () => {
      cancelled = true;
    };
  }, []);

  // No caching, no revalidation, no deduplication...
}
```

### With SWR

```tsx
function Reports() {
  const { data, error, isLoading } = useSWR('/api/reports', fetcher);

  // Automatic caching, revalidation, deduplication!
}
```

### Feature Comparison

| Feature | useEffect | SWR |
|---------|-----------|-----|
| Lines of code | ~30 | ~3 |
| Caching | Manual | Automatic |
| Race conditions | Handle manually | Automatic |
| Deduplication | None | Automatic |
| Focus revalidation | None | Automatic |
| Error retry | Manual | Automatic |
| Loading state | Manual | Built-in |
| TypeScript support | Manual types | Built-in |

---

## This Project's Implementation

Personal OS uses SWR throughout the frontend. Here are key patterns:

### Location: `web/frontend/src/lib/api.ts`

```typescript
const API_BASE = '/api';

// Standard fetcher with error handling
const fetcher = async (url: string) => {
  const response = await fetch(`${API_BASE}${url}`);
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }
  return response.json();
};
```

### Component Example: Report List

```tsx
// web/frontend/src/app/reports/page.tsx
import useSWR from 'swr';

function ReportsPage() {
  const { data, error, isLoading, mutate } = useSWR('/reports', fetcher);

  async function handleDelete(id: number) {
    // Optimistic update
    mutate(
      { ...data, items: data.items.filter(r => r.id !== id) },
      false
    );

    await fetch(`/api/reports/${id}`, { method: 'DELETE' });
    mutate();  // Revalidate
  }

  if (isLoading) return <Skeleton />;
  if (error) return <Error />;

  return (
    <div>
      {data.items.map(report => (
        <ReportCard
          key={report.id}
          report={report}
          onDelete={() => handleDelete(report.id)}
        />
      ))}
    </div>
  );
}
```

### Common Patterns in This Project

1. **API client functions with SWR hooks**:
```tsx
// Custom hook for reports
function useReports(page = 1) {
  return useSWR(`/reports?page=${page}`, fetcher);
}

// Usage
const { data } = useReports(currentPage);
```

2. **Mutation after create/update**:
```tsx
async function createReport(data) {
  await fetch('/api/analysis', { method: 'POST', body: JSON.stringify(data) });
  mutate('/reports');  // Refresh list
}
```

3. **Conditional fetching for details**:
```tsx
function ReportDetail({ id }) {
  const { data } = useSWR(id ? `/reports/${id}` : null, fetcher);
}
```

---

## Practice Exercises

### Exercise 1: Create a Custom Hook

Create a `useReport` hook that fetches a single report:

```tsx
// Implement this:
function useReport(id: number | null) {
  // Return { report, error, isLoading, mutate }
}

// Usage:
const { report, isLoading } = useReport(42);
```

### Exercise 2: Optimistic Delete

Implement optimistic delete for reports:

1. Remove from UI immediately
2. Send DELETE request
3. Revalidate on success
4. Restore on error

### Exercise 3: Polling Dashboard

Create a dashboard that polls for updates:

```tsx
// Implement live stats that refresh every 10 seconds
function LiveStats() {
  // Use refreshInterval option
}
```

### Exercise 4: Search with Debounce

Combine SWR with debounced search:

```tsx
function SearchReports() {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 300);

  // Only fetch when debounced query changes
  const { data } = useSWR(
    debouncedQuery ? `/search?q=${debouncedQuery}` : null,
    fetcher
  );
}
```

---

## Summary

| Concept | Key Points |
|---------|------------|
| useSWR | Main hook: `useSWR(key, fetcher)` |
| Returns | `{ data, error, isLoading, isValidating, mutate }` |
| Caching | Automatic, based on key |
| Revalidation | On focus, reconnect, interval, or manual |
| Mutation | Use `mutate()` for optimistic updates |
| Conditional | Pass `null` as key to disable |

### When to Use SWR

- Fetching data from APIs
- Real-time data updates
- Paginated/infinite lists
- Search with caching
- Dashboard data polling

### When NOT to Use SWR

- Form state management (use form libraries)
- Global app state (use React Context or Zustand)
- One-time operations (use plain fetch)

---

*Learning Guide - SWR Data Fetching*

*Built with [Claude Code](https://claude.ai/code) powered by Claude Opus 4.5*
