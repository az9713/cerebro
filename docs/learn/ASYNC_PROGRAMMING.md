# Async Programming for Traditional Developers

This guide explains asynchronous programming for developers coming from C++/Java who are used to multi-threaded programming. We'll cover why async exists, how it works, and patterns in both Python and JavaScript.

---

## Table of Contents

1. [Why Async?](#why-async)
2. [Sync vs Async vs Threading](#sync-vs-async-vs-threading)
3. [The Event Loop](#the-event-loop)
4. [Callbacks (The Old Way)](#callbacks-the-old-way)
5. [Promises (JavaScript)](#promises-javascript)
6. [Async/Await (Both Languages)](#asyncawait-both-languages)
7. [Python Asyncio](#python-asyncio)
8. [JavaScript Async](#javascript-async)
9. [Common Patterns](#common-patterns)
10. [Error Handling](#error-handling)
11. [Parallel vs Sequential](#parallel-vs-sequential)
12. [Common Mistakes](#common-mistakes)
13. [Practice Exercises](#practice-exercises)

---

## Why Async?

### The Problem: Waiting

Many operations take time:
- Network requests (API calls, database queries)
- File I/O (reading/writing files)
- User input

In synchronous code, the program **blocks** (waits) during these operations:

```python
# Synchronous - program freezes while waiting
result1 = fetch_from_server_1()  # Wait 2 seconds
result2 = fetch_from_server_2()  # Wait 2 seconds
# Total: 4 seconds
```

### Traditional Solution: Threads

In C++/Java, you'd use threads:

```java
// Java - Multi-threaded
Thread t1 = new Thread(() -> fetchFromServer1());
Thread t2 = new Thread(() -> fetchFromServer2());
t1.start();
t2.start();
t1.join();
t2.join();
// Both run simultaneously - about 2 seconds total
```

But threads have problems:
- Memory overhead (each thread needs stack space)
- Complexity (race conditions, deadlocks)
- Limited scalability (can't have 10,000 threads)

### Modern Solution: Async

Async programming runs on a **single thread** but doesn't block on I/O:

```python
# Async - single thread, no blocking
result1, result2 = await asyncio.gather(
    fetch_from_server_1(),
    fetch_from_server_2()
)
# Total: ~2 seconds (runs concurrently)
```

---

## Sync vs Async vs Threading

### Analogy: Coffee Shop

**Synchronous (1 barista, blocking):**
```
Customer 1: Order → Wait for coffee → Receive coffee
Customer 2: Order → Wait for coffee → Receive coffee
Customer 3: Order → Wait for coffee → Receive coffee
Total time: 3 × coffee time
```

**Multi-threaded (3 baristas):**
```
Barista 1: Customer 1's coffee
Barista 2: Customer 2's coffee  (all at once)
Barista 3: Customer 3's coffee
Total time: 1 × coffee time
```

**Async (1 barista, non-blocking):**
```
Customer 1: Order → Start brewing
Customer 2: Order → Start brewing
Customer 3: Order → Start brewing
(Wait for all to finish)
All receive coffee
Total time: 1 × coffee time
```

The async barista starts all orders before any finish. They're **concurrent** but not **parallel**.

### Comparison Table

| Aspect | Synchronous | Multi-threaded | Async |
|--------|-------------|----------------|-------|
| Threads | 1 | Many | 1 |
| Blocking | Yes | No | No |
| Memory | Low | High | Low |
| Complexity | Low | High | Medium |
| Best for | CPU work | CPU parallelism | I/O operations |

---

## The Event Loop

Async programming uses an **event loop**:

```
┌─────────────────────────────────────────────────────────────────┐
│                         EVENT LOOP                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. Pick next task from queue                                   │
│  2. Run task until it hits await (I/O operation)                │
│  3. Register callback for when I/O completes                    │
│  4. Pick next task from queue                                   │
│  5. When I/O completes, add continuation to queue               │
│  6. Repeat forever                                              │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘

┌────────────────┐    ┌────────────────┐    ┌────────────────┐
│  Task Queue    │    │  Running Task  │    │   I/O Pending  │
│                │    │                │    │                │
│  - Task A      │───▶│  - Task B      │───▶│  - Task C      │
│  - Task D      │    │    (running)   │    │    (waiting)   │
└────────────────┘    └────────────────┘    └────────────────┘
```

### Key Insight

When you `await` something:
1. The current function **pauses**
2. Control returns to the event loop
3. Other tasks can run
4. When I/O completes, function **resumes**

```python
async def example():
    print("1. Start")
    result = await fetch_data()  # Pause here, let others run
    print("2. Got result")        # Resume when fetch completes
```

---

## Callbacks (The Old Way)

Before promises/async, we used callbacks:

### JavaScript Callbacks

```javascript
// Callback style (old)
function fetchUser(userId, callback) {
    setTimeout(() => {
        callback(null, { id: userId, name: "Alice" });
    }, 1000);
}

fetchUser(123, (error, user) => {
    if (error) {
        console.error(error);
        return;
    }
    console.log(user);
});
```

### Callback Hell

Nested callbacks become unreadable:

```javascript
// Callback hell
getUser(userId, (err, user) => {
    if (err) handleError(err);
    getOrders(user.id, (err, orders) => {
        if (err) handleError(err);
        getProduct(orders[0].productId, (err, product) => {
            if (err) handleError(err);
            console.log(product);
        });
    });
});
```

This is why we have Promises and async/await.

---

## Promises (JavaScript)

A **Promise** represents a value that will be available in the future.

### Promise States

```
┌─────────┐     ┌───────────┐     ┌──────────┐
│ Pending │────▶│ Fulfilled │────▶│  Value   │
│         │     └───────────┘     └──────────┘
│         │
│         │     ┌───────────┐     ┌──────────┐
│         │────▶│ Rejected  │────▶│  Error   │
└─────────┘     └───────────┘     └──────────┘
```

### Creating Promises

```javascript
// Create a promise
const promise = new Promise((resolve, reject) => {
    setTimeout(() => {
        const success = true;
        if (success) {
            resolve("Data loaded!");  // Fulfilled
        } else {
            reject(new Error("Failed"));  // Rejected
        }
    }, 1000);
});

// Use the promise
promise
    .then(result => console.log(result))   // If fulfilled
    .catch(error => console.error(error))  // If rejected
    .finally(() => console.log("Done"));   // Always
```

### Promise Chaining

```javascript
fetch('/api/user')
    .then(response => response.json())      // Returns Promise<User>
    .then(user => fetch(`/api/orders/${user.id}`))  // Returns Promise<Response>
    .then(response => response.json())      // Returns Promise<Order[]>
    .then(orders => console.log(orders))
    .catch(error => console.error(error));  // Catches any error in chain
```

### Promise Utilities

```javascript
// Wait for all to complete
const [result1, result2] = await Promise.all([
    fetch('/api/data1'),
    fetch('/api/data2')
]);

// Wait for first to complete
const fastest = await Promise.race([
    fetch('/server1/data'),
    fetch('/server2/data')
]);

// Wait for all, even if some fail
const results = await Promise.allSettled([
    fetch('/api/data1'),
    fetch('/api/data2')
]);
// results = [{status: 'fulfilled', value: ...}, {status: 'rejected', reason: ...}]
```

---

## Async/Await (Both Languages)

`async/await` makes asynchronous code look synchronous.

### JavaScript

```javascript
// Mark function as async
async function loadData() {
    // await pauses until promise resolves
    const response = await fetch('/api/data');
    const data = await response.json();
    return data;
}

// Call it
loadData().then(data => console.log(data));

// Or from another async function
async function main() {
    const data = await loadData();
    console.log(data);
}
```

### Python

```python
import asyncio

# Mark function as async
async def load_data():
    # await pauses until coroutine completes
    data = await fetch_from_server()
    return data

# Call it
asyncio.run(load_data())

# Or from another async function
async def main():
    data = await load_data()
    print(data)
```

### Key Rules

1. You can only use `await` inside an `async` function
2. An `async` function always returns a Promise (JS) or Coroutine (Python)
3. Calling an `async` function without `await` doesn't wait for it

```javascript
// Common mistake
async function example() {
    const data = loadData();  // No await! Returns Promise, not data
    console.log(data);        // Prints: Promise { <pending> }
}

// Correct
async function example() {
    const data = await loadData();  // Wait for it
    console.log(data);              // Prints actual data
}
```

---

## Python Asyncio

### Basic Structure

```python
import asyncio

async def main():
    print("Start")
    await asyncio.sleep(1)  # Async sleep (doesn't block)
    print("End")

# Run the async function
asyncio.run(main())
```

### Async HTTP with httpx

```python
import httpx

async def fetch_data():
    async with httpx.AsyncClient() as client:
        response = await client.get('https://api.example.com/data')
        return response.json()

async def main():
    data = await fetch_data()
    print(data)

asyncio.run(main())
```

### Running Multiple Tasks

```python
async def fetch_user(user_id):
    await asyncio.sleep(1)  # Simulate API call
    return {"id": user_id, "name": f"User {user_id}"}

async def main():
    # Sequential (slow)
    user1 = await fetch_user(1)
    user2 = await fetch_user(2)
    # Takes 2 seconds

    # Parallel (fast)
    user1, user2 = await asyncio.gather(
        fetch_user(1),
        fetch_user(2)
    )
    # Takes 1 second

asyncio.run(main())
```

### Async Context Managers

```python
# Regular file (synchronous)
with open('file.txt') as f:
    content = f.read()

# Async file (with aiofiles library)
import aiofiles

async with aiofiles.open('file.txt') as f:
    content = await f.read()
```

### Async in FastAPI

FastAPI is async-first:

```python
from fastapi import FastAPI

app = FastAPI()

@app.get("/data")
async def get_data():
    result = await fetch_from_database()
    return result
```

---

## JavaScript Async

### Basic Pattern

```javascript
// Async function
async function fetchData() {
    const response = await fetch('/api/data');
    const data = await response.json();
    return data;
}

// Usage in event handler
button.addEventListener('click', async () => {
    const data = await fetchData();
    displayData(data);
});

// Top-level await (in modules)
const data = await fetchData();
```

### Fetch API

```javascript
// GET request
async function getReports() {
    const response = await fetch('/api/reports');
    if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
    }
    return response.json();
}

// POST request
async function submitAnalysis(url) {
    const response = await fetch('/api/analysis/youtube', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ url, model: 'sonnet' })
    });
    return response.json();
}
```

### Async in React

```javascript
import { useState, useEffect } from 'react';

function ReportsList() {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function loadReports() {
            try {
                const response = await fetch('/api/reports');
                const data = await response.json();
                setReports(data.reports);
            } catch (e) {
                setError(e.message);
            } finally {
                setLoading(false);
            }
        }

        loadReports();
    }, []);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;
    return <ul>{reports.map(r => <li key={r.id}>{r.title}</li>)}</ul>;
}
```

---

## Common Patterns

### Pattern 1: Retry on Failure

```javascript
async function fetchWithRetry(url, retries = 3) {
    for (let i = 0; i < retries; i++) {
        try {
            const response = await fetch(url);
            return response.json();
        } catch (error) {
            if (i === retries - 1) throw error;
            console.log(`Retry ${i + 1}/${retries}`);
            await new Promise(r => setTimeout(r, 1000 * (i + 1)));
        }
    }
}
```

### Pattern 2: Timeout

```javascript
async function fetchWithTimeout(url, timeout = 5000) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
        const response = await fetch(url, { signal: controller.signal });
        return response.json();
    } finally {
        clearTimeout(timeoutId);
    }
}
```

### Pattern 3: Polling

```javascript
async function pollUntilComplete(jobId, interval = 2000) {
    while (true) {
        const response = await fetch(`/api/jobs/${jobId}`);
        const job = await response.json();

        if (job.status === 'completed') return job.result;
        if (job.status === 'failed') throw new Error(job.error);

        await new Promise(r => setTimeout(r, interval));
    }
}
```

### Pattern 4: Loading State

```javascript
const [loading, setLoading] = useState(false);
const [data, setData] = useState(null);
const [error, setError] = useState(null);

async function handleSubmit() {
    setLoading(true);
    setError(null);

    try {
        const result = await submitData();
        setData(result);
    } catch (e) {
        setError(e.message);
    } finally {
        setLoading(false);
    }
}
```

---

## Error Handling

### Try/Catch

```javascript
async function loadData() {
    try {
        const response = await fetch('/api/data');
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Failed to load:', error);
        throw error;  // Re-throw if caller needs to handle
    }
}
```

### Python

```python
async def load_data():
    try:
        response = await client.get('/api/data')
        response.raise_for_status()
        return response.json()
    except httpx.HTTPStatusError as e:
        print(f"HTTP error: {e}")
        raise
    except Exception as e:
        print(f"Error: {e}")
        raise
```

### Catching in Promise.all

```javascript
// If any fails, all fail
try {
    const [a, b] = await Promise.all([fetchA(), fetchB()]);
} catch (error) {
    // One of them failed
}

// Get results even if some fail
const results = await Promise.allSettled([fetchA(), fetchB()]);
for (const result of results) {
    if (result.status === 'fulfilled') {
        console.log(result.value);
    } else {
        console.error(result.reason);
    }
}
```

---

## Parallel vs Sequential

### Sequential (Slow)

```javascript
async function sequential() {
    const a = await fetchA();  // Wait 1 second
    const b = await fetchB();  // Wait 1 second
    const c = await fetchC();  // Wait 1 second
    return [a, b, c];
    // Total: 3 seconds
}
```

### Parallel (Fast)

```javascript
async function parallel() {
    const [a, b, c] = await Promise.all([
        fetchA(),
        fetchB(),
        fetchC()
    ]);
    return [a, b, c];
    // Total: 1 second (all run at once)
}
```

### When to Use Which

**Sequential** when operations depend on each other:
```javascript
const user = await getUser();
const orders = await getOrders(user.id);  // Needs user.id
const products = await getProducts(orders);  // Needs orders
```

**Parallel** when operations are independent:
```javascript
const [users, products, settings] = await Promise.all([
    getUsers(),
    getProducts(),
    getSettings()
]);
```

---

## Common Mistakes

### 1. Forgetting await

```javascript
// Wrong - returns Promise, not data
async function wrong() {
    const data = fetch('/api/data');
    return data;  // Promise { <pending> }
}

// Right
async function right() {
    const response = await fetch('/api/data');
    const data = await response.json();
    return data;
}
```

### 2. Awaiting Non-Promises

```javascript
// Unnecessary but harmless
const x = await 5;  // x = 5

// But don't do this:
const obj = await { a: 1 };  // Not a promise!
```

### 3. Sequential When Parallel is Possible

```javascript
// Slow
const users = await fetchUsers();
const products = await fetchProducts();

// Fast
const [users, products] = await Promise.all([
    fetchUsers(),
    fetchProducts()
]);
```

### 4. Not Handling Errors

```javascript
// Bad - unhandled promise rejection
async function bad() {
    const data = await fetch('/api/data');  // Could fail!
    return data;
}

// Good
async function good() {
    try {
        const data = await fetch('/api/data');
        return data;
    } catch (error) {
        console.error('Failed:', error);
        return null;
    }
}
```

### 5. Blocking the Event Loop

```javascript
// Bad - CPU-intensive work blocks event loop
async function bad() {
    for (let i = 0; i < 1000000000; i++) {
        // Heavy computation - no await, blocks everything!
    }
}

// Better - break up heavy work
async function better() {
    for (let i = 0; i < 1000; i++) {
        await doChunk(i);  // Let other tasks run
    }
}
```

---

## Practice Exercises

### Exercise 1: Sequential to Parallel

Convert this sequential code to parallel:

```javascript
async function loadDashboard() {
    const user = await fetchUser();
    const stats = await fetchStats();
    const notifications = await fetchNotifications();
    return { user, stats, notifications };
}
```

### Exercise 2: Error Handling

Add proper error handling:

```javascript
async function getReport(id) {
    const response = await fetch(`/api/reports/${id}`);
    return response.json();
}
```

### Exercise 3: Polling

Write a function that polls an API every 2 seconds until `status === "done"`:

```javascript
async function waitForDone(jobId) {
    // Your code here
}
```

### Exercise 4: Timeout

Make this function timeout after 5 seconds:

```javascript
async function fetchData() {
    const response = await fetch('/api/slow-endpoint');
    return response.json();
}
```

---

## Summary Comparison

| Concept | JavaScript | Python |
|---------|------------|--------|
| Promise | `Promise` | `asyncio.Future` |
| Async function | `async function` | `async def` |
| Wait | `await` | `await` |
| Parallel | `Promise.all()` | `asyncio.gather()` |
| Race | `Promise.race()` | `asyncio.wait()` |
| Sleep | `await new Promise(r => setTimeout(r, ms))` | `await asyncio.sleep(s)` |
| Run | Automatic (event loop) | `asyncio.run()` |

---

## What's Next?

Now that you understand async programming:

1. **[FASTAPI_GUIDE.md](FASTAPI_GUIDE.md)** - Build async APIs with Python
2. **[REACT_FUNDAMENTALS.md](REACT_FUNDAMENTALS.md)** - Use async in React components

---

*Async Programming Guide - Created 2025-12-25*

*Built with [Claude Code](https://claude.ai/code) powered by Claude Opus 4.5*
