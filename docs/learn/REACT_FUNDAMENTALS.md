# React Fundamentals for Traditional Developers

This guide teaches React to developers who haven't built modern web UIs before. We'll cover components, state, hooks, and common patterns.

---

## Table of Contents

1. [What is React?](#what-is-react)
2. [Components](#components)
3. [JSX](#jsx)
4. [Props](#props)
5. [State](#state)
6. [Hooks](#hooks)
7. [Event Handling](#event-handling)
8. [Conditional Rendering](#conditional-rendering)
9. [Lists and Keys](#lists-and-keys)
10. [Forms](#forms)
11. [Component Lifecycle](#component-lifecycle)
12. [Fetching Data](#fetching-data)
13. [Common Patterns](#common-patterns)
14. [Practice Exercises](#practice-exercises)

---

## What is React?

React is a JavaScript library for building user interfaces. It lets you create **components** - reusable pieces of UI.

### Traditional Web vs React

**Traditional (jQuery/plain JS):**
```html
<div id="counter">
    <span id="count">0</span>
    <button onclick="increment()">+</button>
</div>

<script>
let count = 0;
function increment() {
    count++;
    document.getElementById('count').innerText = count;
}
</script>
```

**React:**
```jsx
function Counter() {
    const [count, setCount] = useState(0);

    return (
        <div>
            <span>{count}</span>
            <button onClick={() => setCount(count + 1)}>+</button>
        </div>
    );
}
```

### Key Differences

| Traditional | React |
|-------------|-------|
| Manually update DOM | React updates DOM for you |
| Scattered logic | Logic in components |
| Imperative (how) | Declarative (what) |
| HTML + JS separate | JSX combines them |

### Mental Model

Think of React like a **function that renders UI**:

```
State + Props → Component → UI

When state changes → Component re-runs → UI updates
```

---

## Components

A component is a **function that returns UI**.

### Function Component

```jsx
// Simple component
function Greeting() {
    return <h1>Hello, World!</h1>;
}

// Using the component
function App() {
    return (
        <div>
            <Greeting />
            <Greeting />
        </div>
    );
}
```

### Component Rules

1. **Name must be PascalCase**: `Greeting`, not `greeting`
2. **Must return something**: JSX, `null`, or array
3. **Must have single root element** (or use Fragment)

```jsx
// Wrong - multiple roots
function Bad() {
    return (
        <h1>Title</h1>
        <p>Content</p>
    );
}

// Right - single root
function Good() {
    return (
        <div>
            <h1>Title</h1>
            <p>Content</p>
        </div>
    );
}

// Right - Fragment (no extra div)
function AlsoGood() {
    return (
        <>
            <h1>Title</h1>
            <p>Content</p>
        </>
    );
}
```

---

## JSX

JSX is HTML-like syntax in JavaScript. It's not HTML!

### JSX vs HTML Differences

| HTML | JSX |
|------|-----|
| `class="..."` | `className="..."` |
| `for="..."` | `htmlFor="..."` |
| `onclick="..."` | `onClick={...}` |
| `<img>` | `<img />` (self-closing) |
| `<br>` | `<br />` |
| `style="color: red"` | `style={{ color: 'red' }}` |

### JavaScript Expressions in JSX

Use curly braces `{}` to embed JavaScript:

```jsx
function Greeting({ name }) {
    const today = new Date().toLocaleDateString();

    return (
        <div>
            <h1>Hello, {name}!</h1>
            <p>Today is {today}</p>
            <p>2 + 2 = {2 + 2}</p>
            <p>{name.toUpperCase()}</p>
        </div>
    );
}
```

### Style in JSX

```jsx
// Inline style (object with camelCase)
<div style={{ backgroundColor: 'blue', fontSize: '16px' }}>
    Styled div
</div>

// CSS class
<div className="my-class">
    Class styled div
</div>

// Conditional class
<div className={isActive ? 'active' : 'inactive'}>
    Conditionally styled
</div>
```

---

## Props

Props are **arguments passed to components**. Like function parameters.

### Passing Props

```jsx
// Parent passes props
function App() {
    return (
        <UserCard
            name="Alice"
            age={30}
            isAdmin={true}
            onClick={() => alert('Clicked!')}
        />
    );
}

// Child receives props
function UserCard(props) {
    return (
        <div onClick={props.onClick}>
            <h2>{props.name}</h2>
            <p>Age: {props.age}</p>
            {props.isAdmin && <span>Admin</span>}
        </div>
    );
}
```

### Destructuring Props (Preferred)

```jsx
function UserCard({ name, age, isAdmin, onClick }) {
    return (
        <div onClick={onClick}>
            <h2>{name}</h2>
            <p>Age: {age}</p>
            {isAdmin && <span>Admin</span>}
        </div>
    );
}
```

### Default Props

```jsx
function Button({ label = "Click me", size = "medium" }) {
    return <button className={`btn-${size}`}>{label}</button>;
}

<Button />                     // Uses defaults
<Button label="Submit" />      // Custom label, default size
<Button size="large" />        // Default label, custom size
```

### Children Prop

```jsx
// Parent
function App() {
    return (
        <Card>
            <h2>Title</h2>
            <p>Content goes here</p>
        </Card>
    );
}

// Child - receives content as children prop
function Card({ children }) {
    return <div className="card">{children}</div>;
}
```

### Props are Read-Only!

```jsx
// WRONG - never modify props
function Bad({ count }) {
    count = count + 1;  // DON'T DO THIS
    return <span>{count}</span>;
}
```

---

## State

State is **data that changes over time**. When state changes, React re-renders.

### useState Hook

```jsx
import { useState } from 'react';

function Counter() {
    // Declare state: [currentValue, setterFunction] = useState(initialValue)
    const [count, setCount] = useState(0);

    return (
        <div>
            <p>Count: {count}</p>
            <button onClick={() => setCount(count + 1)}>+</button>
            <button onClick={() => setCount(count - 1)}>-</button>
            <button onClick={() => setCount(0)}>Reset</button>
        </div>
    );
}
```

### State Updates are Async

```jsx
// WRONG - state doesn't update immediately
function Wrong() {
    const [count, setCount] = useState(0);

    function handleClick() {
        setCount(count + 1);
        console.log(count);  // Still 0!
    }
}

// RIGHT - use functional update when depending on previous state
function Right() {
    const [count, setCount] = useState(0);

    function handleClick() {
        setCount(prev => prev + 1);  // Uses previous value
    }
}
```

### State with Objects

```jsx
function Form() {
    const [user, setUser] = useState({
        name: '',
        email: '',
        age: 0
    });

    function handleNameChange(e) {
        // WRONG - mutates state directly
        // user.name = e.target.value;

        // RIGHT - create new object
        setUser({
            ...user,           // Copy existing properties
            name: e.target.value  // Update one property
        });
    }

    return (
        <input
            value={user.name}
            onChange={handleNameChange}
        />
    );
}
```

### State with Arrays

```jsx
function TodoList() {
    const [todos, setTodos] = useState(['Learn React']);

    function addTodo(text) {
        // WRONG - push mutates
        // todos.push(text);

        // RIGHT - spread to new array
        setTodos([...todos, text]);
    }

    function removeTodo(index) {
        setTodos(todos.filter((_, i) => i !== index));
    }

    function updateTodo(index, newText) {
        setTodos(todos.map((todo, i) =>
            i === index ? newText : todo
        ));
    }
}
```

---

## Hooks

Hooks are functions that let you use React features. They start with `use`.

### Common Hooks

| Hook | Purpose |
|------|---------|
| `useState` | Manage local state |
| `useEffect` | Side effects (API calls, timers) |
| `useContext` | Access context |
| `useRef` | Reference DOM elements |
| `useMemo` | Cache expensive calculations |
| `useCallback` | Cache functions |

### useEffect

Run code when component mounts or state changes:

```jsx
import { useState, useEffect } from 'react';

function DataFetcher() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    // Run on mount (empty dependency array)
    useEffect(() => {
        async function fetchData() {
            const response = await fetch('/api/data');
            const result = await response.json();
            setData(result);
            setLoading(false);
        }
        fetchData();
    }, []);  // Empty array = run once on mount

    if (loading) return <div>Loading...</div>;
    return <div>{JSON.stringify(data)}</div>;
}
```

### useEffect Dependencies

```jsx
// Run once on mount
useEffect(() => {
    console.log('Mounted');
}, []);

// Run when count changes
useEffect(() => {
    console.log('Count changed to', count);
}, [count]);

// Run on every render (rarely needed)
useEffect(() => {
    console.log('Rendered');
});

// Cleanup on unmount
useEffect(() => {
    const timer = setInterval(() => console.log('tick'), 1000);
    return () => clearInterval(timer);  // Cleanup function
}, []);
```

### useRef

Access DOM elements or persist values between renders:

```jsx
function TextInput() {
    const inputRef = useRef(null);

    function handleClick() {
        inputRef.current.focus();
    }

    return (
        <>
            <input ref={inputRef} />
            <button onClick={handleClick}>Focus Input</button>
        </>
    );
}
```

### Custom Hooks

Extract reusable logic into custom hooks:

```jsx
// Custom hook for fetching data
function useFetch(url) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function fetchData() {
            try {
                const response = await fetch(url);
                const result = await response.json();
                setData(result);
            } catch (e) {
                setError(e.message);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [url]);

    return { data, loading, error };
}

// Use it in any component
function UserProfile({ userId }) {
    const { data, loading, error } = useFetch(`/api/users/${userId}`);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;
    return <div>{data.name}</div>;
}
```

---

## Event Handling

### Basic Events

```jsx
function Button() {
    function handleClick() {
        alert('Clicked!');
    }

    return <button onClick={handleClick}>Click me</button>;
}

// Or inline
<button onClick={() => alert('Clicked!')}>Click me</button>
```

### Event Object

```jsx
function Input() {
    function handleChange(event) {
        console.log('Value:', event.target.value);
    }

    return <input onChange={handleChange} />;
}
```

### Passing Arguments

```jsx
function List({ items }) {
    function handleDelete(id) {
        console.log('Delete', id);
    }

    return (
        <ul>
            {items.map(item => (
                <li key={item.id}>
                    {item.name}
                    <button onClick={() => handleDelete(item.id)}>
                        Delete
                    </button>
                </li>
            ))}
        </ul>
    );
}
```

### Prevent Default

```jsx
function Form() {
    function handleSubmit(e) {
        e.preventDefault();  // Prevent page reload
        console.log('Form submitted');
    }

    return (
        <form onSubmit={handleSubmit}>
            <button type="submit">Submit</button>
        </form>
    );
}
```

---

## Conditional Rendering

### if/else

```jsx
function Greeting({ isLoggedIn }) {
    if (isLoggedIn) {
        return <h1>Welcome back!</h1>;
    }
    return <h1>Please sign in</h1>;
}
```

### Ternary Operator

```jsx
function Greeting({ isLoggedIn }) {
    return (
        <h1>
            {isLoggedIn ? 'Welcome back!' : 'Please sign in'}
        </h1>
    );
}
```

### Logical AND (&&)

```jsx
function Notification({ count }) {
    return (
        <div>
            {count > 0 && <span>You have {count} messages</span>}
        </div>
    );
}
```

### Multiple Conditions

```jsx
function StatusBadge({ status }) {
    if (status === 'loading') return <span>Loading...</span>;
    if (status === 'error') return <span>Error!</span>;
    if (status === 'success') return <span>Done!</span>;
    return null;
}
```

---

## Lists and Keys

### Rendering Lists

```jsx
function TodoList({ todos }) {
    return (
        <ul>
            {todos.map(todo => (
                <li key={todo.id}>{todo.text}</li>
            ))}
        </ul>
    );
}
```

### Keys are Required!

Keys help React identify which items changed:

```jsx
// WRONG - using index as key (causes bugs)
{items.map((item, index) => (
    <li key={index}>{item.name}</li>
))}

// RIGHT - use unique identifier
{items.map(item => (
    <li key={item.id}>{item.name}</li>
))}
```

### Extracting List Item Component

```jsx
function TodoItem({ todo, onDelete }) {
    return (
        <li>
            {todo.text}
            <button onClick={() => onDelete(todo.id)}>Delete</button>
        </li>
    );
}

function TodoList({ todos, onDelete }) {
    return (
        <ul>
            {todos.map(todo => (
                <TodoItem key={todo.id} todo={todo} onDelete={onDelete} />
            ))}
        </ul>
    );
}
```

---

## Forms

### Controlled Components

React controls the input value:

```jsx
function LoginForm() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    function handleSubmit(e) {
        e.preventDefault();
        console.log('Login:', email, password);
    }

    return (
        <form onSubmit={handleSubmit}>
            <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
            />
            <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
            />
            <button type="submit">Login</button>
        </form>
    );
}
```

### Form with Multiple Fields

```jsx
function RegistrationForm() {
    const [form, setForm] = useState({
        name: '',
        email: '',
        age: ''
    });

    function handleChange(e) {
        const { name, value } = e.target;
        setForm(prev => ({
            ...prev,
            [name]: value
        }));
    }

    return (
        <form>
            <input name="name" value={form.name} onChange={handleChange} />
            <input name="email" value={form.email} onChange={handleChange} />
            <input name="age" value={form.age} onChange={handleChange} />
        </form>
    );
}
```

### Select and Checkbox

```jsx
function Preferences() {
    const [color, setColor] = useState('red');
    const [newsletter, setNewsletter] = useState(false);

    return (
        <form>
            <select value={color} onChange={(e) => setColor(e.target.value)}>
                <option value="red">Red</option>
                <option value="blue">Blue</option>
                <option value="green">Green</option>
            </select>

            <label>
                <input
                    type="checkbox"
                    checked={newsletter}
                    onChange={(e) => setNewsletter(e.target.checked)}
                />
                Subscribe to newsletter
            </label>
        </form>
    );
}
```

---

## Component Lifecycle

### Lifecycle in Function Components

```jsx
function LifecycleExample() {
    // On mount
    useEffect(() => {
        console.log('Component mounted');

        // On unmount
        return () => {
            console.log('Component unmounted');
        };
    }, []);

    // On update
    useEffect(() => {
        console.log('Component updated');
    });

    return <div>Lifecycle Example</div>;
}
```

### Comparison to Class Lifecycle

| Class Component | Function Component |
|-----------------|-------------------|
| `constructor` | `useState` initial value |
| `componentDidMount` | `useEffect(() => {}, [])` |
| `componentDidUpdate` | `useEffect(() => {}, [deps])` |
| `componentWillUnmount` | `useEffect(() => () => {}, [])` |

---

## Fetching Data

### Basic Pattern

```jsx
function Reports() {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function loadReports() {
            try {
                const response = await fetch('/api/reports');
                if (!response.ok) throw new Error('Failed to fetch');
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

    return (
        <ul>
            {reports.map(report => (
                <li key={report.id}>{report.title}</li>
            ))}
        </ul>
    );
}
```

### Fetching on User Action

```jsx
function SearchResults() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);

    async function handleSearch() {
        setLoading(true);
        const response = await fetch(`/api/search?q=${query}`);
        const data = await response.json();
        setResults(data.results);
        setLoading(false);
    }

    return (
        <div>
            <input value={query} onChange={(e) => setQuery(e.target.value)} />
            <button onClick={handleSearch} disabled={loading}>
                {loading ? 'Searching...' : 'Search'}
            </button>
            <ul>
                {results.map(r => <li key={r.id}>{r.title}</li>)}
            </ul>
        </div>
    );
}
```

---

## Common Patterns

### Lifting State Up

When multiple components need the same state, move it to their parent:

```jsx
function Parent() {
    const [count, setCount] = useState(0);

    return (
        <div>
            <Display count={count} />
            <Controls count={count} setCount={setCount} />
        </div>
    );
}

function Display({ count }) {
    return <h1>Count: {count}</h1>;
}

function Controls({ count, setCount }) {
    return (
        <div>
            <button onClick={() => setCount(count - 1)}>-</button>
            <button onClick={() => setCount(count + 1)}>+</button>
        </div>
    );
}
```

### Composition

Build complex UI from simple components:

```jsx
function Dialog({ title, children, footer }) {
    return (
        <div className="dialog">
            <div className="dialog-header">{title}</div>
            <div className="dialog-body">{children}</div>
            <div className="dialog-footer">{footer}</div>
        </div>
    );
}

function ConfirmDialog({ message, onConfirm, onCancel }) {
    return (
        <Dialog
            title="Confirm"
            footer={
                <>
                    <button onClick={onCancel}>Cancel</button>
                    <button onClick={onConfirm}>Confirm</button>
                </>
            }
        >
            <p>{message}</p>
        </Dialog>
    );
}
```

### Container/Presentational Pattern

Separate logic from UI:

```jsx
// Container (logic)
function ReportListContainer() {
    const { data, loading, error } = useFetch('/api/reports');

    if (loading) return <Loading />;
    if (error) return <Error message={error} />;

    return <ReportList reports={data.reports} />;
}

// Presentational (UI)
function ReportList({ reports }) {
    return (
        <ul className="report-list">
            {reports.map(report => (
                <ReportItem key={report.id} report={report} />
            ))}
        </ul>
    );
}

function ReportItem({ report }) {
    return (
        <li className="report-item">
            <h3>{report.title}</h3>
            <p>{report.summary}</p>
        </li>
    );
}
```

---

## Practice Exercises

### Exercise 1: Counter with History

Create a counter that:
- Shows current count
- Has increment/decrement buttons
- Shows history of all values

### Exercise 2: Todo List

Create a todo list that:
- Shows list of todos
- Has input to add new todo
- Each todo has delete button
- Persists to localStorage

### Exercise 3: User Profile Loader

Create a component that:
- Takes a userId prop
- Fetches user data on mount
- Shows loading state
- Shows error if fetch fails
- Shows user info when loaded

---

## Summary

| Concept | What It Is |
|---------|-----------|
| Component | Function that returns UI |
| JSX | HTML-like syntax in JavaScript |
| Props | Arguments passed to components |
| State | Data that changes over time |
| useState | Hook to create state |
| useEffect | Hook for side effects |
| Event | User interaction (click, change) |
| Key | Unique identifier for list items |

---

## What's Next?

Now that you understand React basics:

1. **[NEXTJS_GUIDE.md](NEXTJS_GUIDE.md)** - Learn the Next.js framework
2. Look at the actual code in `web/frontend/src/`

---

*React Fundamentals - Created 2025-12-25*

*Built with [Claude Code](https://claude.ai/code) powered by Claude Opus 4.5*
